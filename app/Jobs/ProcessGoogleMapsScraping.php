<?php

namespace App\Jobs;

use App\Models\GoogleMapPlace;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ProcessGoogleMapsScraping implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     */
    public $tries = 3;

    /**
     * The number of seconds the job can run before timing out.
     */
    public $timeout = 600; // 10 minutes

    /**
     * Delete the job if its models no longer exist.
     */
    public $deleteWhenMissingModels = true;

    /**
     * Job parameters
     */
    protected $userId;
    protected $keyword;
    protected $location;
    protected $kecamatan;
    protected $maxResults;
    protected $jobId;

    /**
     * Create a new job instance.
     */
    public function __construct(
        int $userId,
        string $keyword,
        string $location,
        string $kecamatan,
        int $maxResults = 20,
        ?string $jobId = null
    ) {
        $this->userId = $userId;
        $this->keyword = $keyword;
        $this->location = $location;
        $this->kecamatan = $kecamatan;
        $this->maxResults = $maxResults;
        $this->jobId = $jobId ?? uniqid('scrape_', true);

        // Set queue priority based on user role
        $user = User::find($userId);
        if ($user && $user->role === 'admin') {
            $this->onQueue('high');
        } else {
            $this->onQueue('default');
        }
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // Update job status to processing
        $this->updateJobStatus('processing', 0);

        try {
            // Check rate limit untuk user ini
            if (!$this->checkRateLimit()) {
                $this->fail(new \Exception('Rate limit exceeded. Please wait before making another request.'));
                return;
            }

            // Check cache dulu
            $cacheKey = $this->getCacheKey();
            $cachedData = Cache::get($cacheKey);

            if ($cachedData) {
                Log::info("Using cached data for job {$this->jobId}");
                $this->savePlaces($cachedData);
                $this->updateJobStatus('completed', 100, count($cachedData));
                return;
            }

            // Call Python scraper API
            $apiUrl = env('PYTHON_SCRAPER_API_URL', 'http://localhost:5001');
            $apiKey = env('PYTHON_SCRAPER_API_KEY', 'chatcepat-secret-key-2024');

            Log::info("Starting scraping job {$this->jobId}", [
                'user_id' => $this->userId,
                'keyword' => $this->keyword,
                'location' => $this->location,
                'kecamatan' => $this->kecamatan,
            ]);

            $response = Http::timeout(300)
                ->withHeaders([
                    'X-API-Key' => $apiKey,
                    'Content-Type' => 'application/json',
                ])
                ->post($apiUrl . '/api/scrape', [
                    'keyword' => $this->keyword,
                    'location' => $this->location,
                    'kecamatan' => $this->kecamatan,
                    'max_results' => $this->maxResults,
                ]);

            if (!$response->successful()) {
                throw new \Exception(
                    $response->json('message') ?? 'Failed to connect to scraper API'
                );
            }

            $output = $response->json();

            if (!$output || $output['status'] !== 'success') {
                throw new \Exception($output['message'] ?? 'Scraping failed');
            }

            $data = $output['data'] ?? [];

            // Cache hasil untuk 24 jam
            Cache::put($cacheKey, $data, now()->addHours(24));

            // Save to database
            $savedCount = $this->savePlaces($data);

            // Increment rate limit counter
            $this->incrementRateLimit();

            // Update job status
            $this->updateJobStatus('completed', 100, $savedCount);

            Log::info("Scraping job {$this->jobId} completed successfully", [
                'total_results' => $savedCount,
            ]);

        } catch (\Exception $e) {
            Log::error("Scraping job {$this->jobId} failed", [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            $this->updateJobStatus('failed', 0, 0, $e->getMessage());

            throw $e; // Re-throw untuk retry mechanism
        }
    }

    /**
     * Check if user has exceeded rate limit
     */
    protected function checkRateLimit(): bool
    {
        $rateLimitKey = "scraper:rate_limit:user_{$this->userId}";

        // Limit: 10 requests per hour untuk regular user
        // Unlimited untuk admin
        $user = User::find($this->userId);

        if ($user && $user->role === 'admin') {
            return true;
        }

        $requests = Cache::get($rateLimitKey, 0);
        $maxRequests = env('SCRAPER_RATE_LIMIT_PER_HOUR', 10);

        return $requests < $maxRequests;
    }

    /**
     * Increment rate limit counter
     */
    protected function incrementRateLimit(): void
    {
        $rateLimitKey = "scraper:rate_limit:user_{$this->userId}";

        $user = User::find($this->userId);
        if ($user && $user->role === 'admin') {
            return; // No limit for admin
        }

        $requests = Cache::get($rateLimitKey, 0);
        Cache::put($rateLimitKey, $requests + 1, now()->addHour());
    }

    /**
     * Get cache key for this search
     */
    protected function getCacheKey(): string
    {
        return sprintf(
            'scraper:cache:%s:%s:%s',
            md5($this->keyword),
            md5($this->location),
            md5($this->kecamatan)
        );
    }

    /**
     * Save places to database
     */
    protected function savePlaces(array $data): int
    {
        $count = 0;

        foreach ($data as $placeData) {
            try {
                // Check if place already exists (prevent duplicates)
                $exists = GoogleMapPlace::where('name', $placeData['name'])
                    ->where('kecamatan', $placeData['kecamatan'])
                    ->where('user_id', $this->userId)
                    ->exists();

                if (!$exists) {
                    $placeData['user_id'] = $this->userId;
                    GoogleMapPlace::create($placeData);
                    $count++;
                }
            } catch (\Exception $e) {
                Log::warning("Failed to save place: {$e->getMessage()}", [
                    'place_data' => $placeData,
                ]);
            }
        }

        return $count;
    }

    /**
     * Update job status in cache
     */
    protected function updateJobStatus(
        string $status,
        int $progress = 0,
        int $totalResults = 0,
        ?string $error = null
    ): void {
        $statusKey = "scraper:job_status:{$this->jobId}";

        Cache::put($statusKey, [
            'job_id' => $this->jobId,
            'user_id' => $this->userId,
            'status' => $status,
            'progress' => $progress,
            'total_results' => $totalResults,
            'keyword' => $this->keyword,
            'location' => $this->location,
            'kecamatan' => $this->kecamatan,
            'error' => $error,
            'updated_at' => now()->toISOString(),
        ], now()->addHours(24));
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error("Scraping job {$this->jobId} failed permanently", [
            'user_id' => $this->userId,
            'error' => $exception->getMessage(),
        ]);

        $this->updateJobStatus('failed', 0, 0, $exception->getMessage());
    }
}
