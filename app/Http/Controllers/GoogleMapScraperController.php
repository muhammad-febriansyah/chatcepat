<?php

namespace App\Http\Controllers;

use App\Models\GoogleMapPlace;
use App\Models\ScraperCategory;
use App\Exports\GoogleMapPlacesExport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;

class GoogleMapScraperController extends Controller
{
    public function index()
    {
        $query = GoogleMapPlace::query();

        // Filter by user_id unless user is admin
        if (auth()->user()->role !== 'admin') {
            $query->where('user_id', auth()->id());
        }

        $places = $query->latest()->paginate(5);

        return Inertia::render('GoogleMapScraper/Index', [
            'places' => $places,
        ]);
    }

    public function results()
    {
        $query = GoogleMapPlace::query();

        // Filter by user_id unless user is admin
        if (auth()->user()->role !== 'admin') {
            $query->where('user_id', auth()->id());
        }

        $places = $query->latest()->paginate(50);

        // Get active categories from database
        $categories = ScraperCategory::active()->ordered()->get();

        return Inertia::render('GoogleMapScraper/Results', [
            'places' => $places,
            'categories' => $categories,
        ]);
    }

    public function maps()
    {
        $query = GoogleMapPlace::query();

        // Filter by user_id unless user is admin
        if (auth()->user()->role !== 'admin') {
            $query->where('user_id', auth()->id());
        }

        // Get all places to show in maps
        $places = $query->latest()->get();

        // Get active categories from database
        $categories = ScraperCategory::active()->ordered()->get();

        return Inertia::render('GoogleMapScraper/Maps', [
            'places' => $places,
            'categories' => $categories,
        ]);
    }

    public function scrape(Request $request)
    {
        $validated = $request->validate([
            'keyword' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'kecamatan' => 'required|string|max:255',
            'max_results' => 'nullable|integer|min:1|max:20', // Fixed to max 20 for safety from Google blocking
        ]);

        $keyword = $validated['keyword'];
        $location = $validated['location'];
        $kecamatan = $validated['kecamatan'];
        $maxResults = $validated['max_results'] ?? 20;

        try {
            // Check rate limit
            $rateLimitKey = "scraper:rate_limit:user_" . auth()->id();
            $requests = \Cache::get($rateLimitKey, 0);
            $maxRequests = env('SCRAPER_RATE_LIMIT_PER_HOUR', 10);

            if (auth()->user()->role !== 'admin' && $requests >= $maxRequests) {
                return response()->json([
                    'status' => 'error',
                    'message' => "Rate limit exceeded. You can make {$maxRequests} requests per hour. Please try again later.",
                ], 429);
            }

            // Check if using sync mode (default for now for better UX)
            $useQueue = env('SCRAPER_USE_QUEUE', false);

            if ($useQueue) {
                // Generate unique job ID
                $jobId = uniqid('scrape_', true);

                // Dispatch queue job (background processing)
                \App\Jobs\ProcessGoogleMapsScraping::dispatch(
                    auth()->id(),
                    $keyword,
                    $location,
                    $kecamatan,
                    $maxResults,
                    $jobId
                );

                return response()->json([
                    'status' => 'queued',
                    'message' => 'Scraping job has been queued. You will be notified when it completes.',
                    'job_id' => $jobId,
                    'check_status_url' => route('admin.google-maps-scraper.job-status', ['jobId' => $jobId]),
                ]);
            }

            // Synchronous processing (immediate results)
            // Check cache dulu
            $cacheKey = sprintf(
                'scraper:cache:%s:%s:%s',
                md5($keyword),
                md5($location),
                md5($kecamatan)
            );
            $cachedData = \Cache::get($cacheKey);

            if ($cachedData) {
                // Save cached data to database
                $this->savePlacesSync($cachedData, auth()->id());

                return response()->json([
                    'status' => 'success',
                    'data' => $cachedData,
                    'total' => count($cachedData),
                    'cached' => true,
                ]);
            }

            // Call Python scraper API
            $apiUrl = env('PYTHON_SCRAPER_API_URL', 'http://localhost:5001');
            $apiKey = env('PYTHON_SCRAPER_API_KEY', 'chatcepat-secret-key-2024');

            \Log::info('Calling Python Scraper API', [
                'url' => $apiUrl,
                'keyword' => $keyword,
                'location' => $location,
                'kecamatan' => $kecamatan,
                'max_results' => $maxResults,
            ]);

            try {
                $response = Http::timeout(300)
                    ->withHeaders([
                        'X-API-Key' => $apiKey,
                        'Content-Type' => 'application/json',
                    ])
                    ->post($apiUrl . '/api/scrape', [
                        'keyword' => $keyword,
                        'location' => $location,
                        'kecamatan' => $kecamatan,
                        'max_results' => $maxResults,
                    ]);
            } catch (\Illuminate\Http\Client\ConnectionException $e) {
                \Log::error('Python API Connection Failed', [
                    'error' => $e->getMessage(),
                    'api_url' => $apiUrl,
                ]);

                return response()->json([
                    'status' => 'error',
                    'message' => 'Cannot connect to scraper service. Please make sure Python API is running at ' . $apiUrl,
                    'details' => $e->getMessage(),
                ], 500);
            }

            \Log::info('Python API Response', [
                'status' => $response->status(),
                'successful' => $response->successful(),
            ]);

            if (!$response->successful()) {
                $errorMsg = $response->json('message') ?? 'Failed to connect to scraper API';
                \Log::error('Python API Error', [
                    'status' => $response->status(),
                    'error' => $errorMsg,
                    'body' => $response->body(),
                ]);

                throw new \Exception($errorMsg);
            }

            $output = $response->json();

            if (!$output || $output['status'] !== 'success') {
                $errorMsg = $output['message'] ?? 'Scraping failed';
                \Log::error('Scraping Failed', [
                    'output' => $output,
                    'error' => $errorMsg,
                ]);

                throw new \Exception($errorMsg);
            }

            $data = $output['data'] ?? [];

            \Log::info('Scraping Success', [
                'total_results' => count($data),
            ]);

            // Cache hasil untuk 24 jam
            \Cache::put($cacheKey, $data, now()->addHours(24));

            // Save to database
            $this->savePlacesSync($data, auth()->id());

            // Increment rate limit counter
            if (auth()->user()->role !== 'admin') {
                \Cache::put($rateLimitKey, $requests + 1, now()->addHour());
            }

            return response()->json([
                'status' => 'success',
                'data' => $data,
                'total' => count($data),
                'cached' => false,
            ]);

        } catch (\Exception $e) {
            \Log::error('Scraping Error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function jobStatus(string $jobId)
    {
        $statusKey = "scraper:job_status:{$jobId}";
        $status = \Cache::get($statusKey);

        if (!$status) {
            return response()->json([
                'status' => 'error',
                'message' => 'Job not found or expired',
            ], 404);
        }

        // Only allow user to check their own job status (unless admin)
        if (auth()->user()->role !== 'admin' && $status['user_id'] !== auth()->id()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized',
            ], 403);
        }

        return response()->json([
            'status' => 'success',
            'data' => $status,
        ]);
    }

    public function show(GoogleMapPlace $place)
    {
        return response()->json($place);
    }

    public function destroy(GoogleMapPlace $place)
    {
        $place->delete();

        return back();
    }

    protected function savePlacesSync(array $data, int $userId): int
    {
        $count = 0;

        foreach ($data as $placeData) {
            try {
                // Check if place already exists (prevent duplicates)
                $exists = GoogleMapPlace::where('name', $placeData['name'])
                    ->where('kecamatan', $placeData['kecamatan'])
                    ->where('user_id', $userId)
                    ->exists();

                if (!$exists) {
                    $placeData['user_id'] = $userId;
                    GoogleMapPlace::create($placeData);
                    $count++;
                }
            } catch (\Exception $e) {
                \Log::warning("Failed to save place: {$e->getMessage()}", [
                    'place_data' => $placeData,
                ]);
            }
        }

        return $count;
    }

    public function exportExcel(Request $request)
    {
        $query = GoogleMapPlace::query();

        // Filter by user_id unless user is admin
        if (auth()->user()->role !== 'admin') {
            $query->where('user_id', auth()->id());
        }

        if ($request->has('kecamatan')) {
            $query->where('kecamatan', $request->kecamatan);
        }

        if ($request->has('location')) {
            $query->where('location', $request->location);
        }

        $places = $query->get();

        $filename = 'google_map_places_' . now()->format('Y-m-d_His') . '.xlsx';

        return Excel::download(new GoogleMapPlacesExport($places), $filename);
    }

    public function exportPdf(Request $request)
    {
        $query = GoogleMapPlace::query();

        // Filter by user_id unless user is admin
        if (auth()->user()->role !== 'admin') {
            $query->where('user_id', auth()->id());
        }

        if ($request->has('kecamatan')) {
            $query->where('kecamatan', $request->kecamatan);
        }

        if ($request->has('location')) {
            $query->where('location', $request->location);
        }

        $places = $query->get();

        $filename = 'google_map_places_' . now()->format('Y-m-d_His') . '.pdf';

        $pdf = Pdf::loadView('exports.google-map-places', [
            'places' => $places,
            'exportDate' => now()->format('d F Y H:i:s')
        ]);

        return $pdf->download($filename);
    }
}
