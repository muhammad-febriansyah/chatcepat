<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\GoogleMapPlace;
use App\Models\ScraperCategory;
use App\Models\WhatsappSession;
use App\Models\WhatsappGroup;
use App\Models\WhatsappGroupMember;
use App\Models\MetaContact;
use App\Jobs\ProcessGoogleMapsScraping;
use App\Services\Meta\MetaContactScraperService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\GoogleMapPlacesExport;
use Barryvdh\DomPDF\Facade\Pdf;

class ScraperController extends Controller
{
    /**
     * Display user's scraping results
     */
    public function index(): Response
    {
        $places = GoogleMapPlace::where('user_id', auth()->id())
            ->latest()
            ->get();

        $categories = ScraperCategory::all();

        $stats = [
            'total_places' => $places->count(),
            'total_categories' => GoogleMapPlace::where('user_id', auth()->id())
                ->whereNotNull('category')
                ->distinct('category')
                ->count('category'),
        ];

        return Inertia::render('user/scraper/index', [
            'places' => $places,
            'categories' => $categories,
            'stats' => $stats,
        ]);
    }

    /**
     * Show scraping form
     */
    public function create(): Response
    {
        $categories = ScraperCategory::all();
        $places = GoogleMapPlace::where('user_id', auth()->id())->get();

        return Inertia::render('user/scraper/create', [
            'categories' => $categories,
            'places' => $places,
        ]);
    }

    /**
     * Start a new scraping job
     */
    public function scrape(Request $request)
    {
        $validated = $request->validate([
            'location' => 'required|string|max:255',
            'kecamatan' => 'required|string|max:255',
            'category_id' => 'required|exists:scraper_categories,id',
            'max_results' => 'nullable|integer|min:1|max:60',
        ]);

        $category = ScraperCategory::findOrFail($validated['category_id']);
        $keyword = $category->name;
        $location = $validated['location'];
        $kecamatan = $validated['kecamatan'];
        $maxResults = $validated['max_results'] ?? 20;

        try {
            // Check cache first
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
                    'success' => true,
                    'status' => 'success',
                    'message' => 'Scraping completed successfully (from cache)',
                    'data' => $cachedData,
                    'total' => count($cachedData),
                    'cached' => true,
                ]);
            }

            // Call Python scraper API
            $apiUrl = env('PYTHON_SCRAPER_API_URL', 'http://localhost:5001');
            $apiKey = env('PYTHON_SCRAPER_API_KEY', 'chatcepat-secret-key-2024');

            \Log::info('User Scraper: Calling Python API', [
                'url' => $apiUrl,
                'keyword' => $keyword,
                'location' => $location,
                'kecamatan' => $kecamatan,
                'max_results' => $maxResults,
                'user_id' => auth()->id(),
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
                \Log::error('User Scraper: Python API Connection Failed', [
                    'error' => $e->getMessage(),
                    'api_url' => $apiUrl,
                ]);

                return response()->json([
                    'success' => false,
                    'status' => 'error',
                    'message' => 'Cannot connect to scraper service. Please make sure Python API is running at ' . $apiUrl,
                    'data' => [],
                ], 500);
            }

            \Log::info('User Scraper: Python API Response', [
                'status' => $response->status(),
                'successful' => $response->successful(),
            ]);

            if (!$response->successful()) {
                $errorMsg = $response->json('message') ?? 'Failed to connect to scraper API';
                \Log::error('User Scraper: Python API Error', [
                    'status' => $response->status(),
                    'error' => $errorMsg,
                    'body' => $response->body(),
                ]);

                return response()->json([
                    'success' => false,
                    'status' => 'error',
                    'message' => $errorMsg,
                    'data' => [],
                ], 500);
            }

            $output = $response->json();

            if (!$output || $output['status'] !== 'success') {
                $errorMsg = $output['message'] ?? 'Scraping failed';
                \Log::error('User Scraper: Scraping Failed', [
                    'output' => $output,
                    'error' => $errorMsg,
                ]);

                return response()->json([
                    'success' => false,
                    'status' => 'error',
                    'message' => $errorMsg,
                    'data' => [],
                ], 500);
            }

            $data = $output['data'] ?? [];

            \Log::info('User Scraper: Scraping Success', [
                'total_results' => count($data),
                'user_id' => auth()->id(),
            ]);

            // Cache hasil untuk 24 jam
            \Cache::put($cacheKey, $data, now()->addHours(24));

            // Save to database
            $savedCount = $this->savePlacesSync($data, auth()->id());

            \Log::info('User Scraper: Saved to Database', [
                'saved_count' => $savedCount,
                'total_received' => count($data),
            ]);

            return response()->json([
                'success' => true,
                'status' => 'success',
                'message' => "Scraping completed successfully! Saved {$savedCount} new places.",
                'data' => $data,
                'total' => count($data),
                'saved' => $savedCount,
                'cached' => false,
            ]);

        } catch (\Exception $e) {
            \Log::error('User Scraper: Exception', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Error: ' . $e->getMessage(),
                'data' => [],
            ], 500);
        }
    }

    /**
     * Save places to database synchronously
     */
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

    /**
     * Show map view of scraped places
     */
    public function maps(): Response
    {
        $places = GoogleMapPlace::where('user_id', auth()->id())
            ->get();

        return Inertia::render('user/scraper/maps', [
            'places' => $places,
        ]);
    }

    /**
     * Export results to Excel
     */
    public function exportExcel(Request $request)
    {
        $places = GoogleMapPlace::where('user_id', auth()->id())
            ->get();

        return Excel::download(
            new GoogleMapPlacesExport($places),
            'scraping-results-' . now()->format('Y-m-d') . '.xlsx'
        );
    }

    /**
     * Export results to PDF
     */
    public function exportPdf(Request $request)
    {
        $places = GoogleMapPlace::where('user_id', auth()->id())
            ->get();

        $pdf = Pdf::loadView('exports.google-map-places-pdf', [
            'places' => $places,
            'date' => now()->format('d M Y'),
        ]);

        return $pdf->download('scraping-results-' . now()->format('Y-m-d') . '.pdf');
    }

    /**
     * Delete a scraped place
     */
    public function destroy(GoogleMapPlace $place): RedirectResponse
    {
        // Ensure user owns this place
        if ($place->user_id !== auth()->id()) {
            abort(403, 'Unauthorized access to this record.');
        }

        $place->delete();

        return redirect()->back()
            ->with('success', 'Place deleted successfully.');
    }

    /**
     * Bulk delete all user's scraped places
     */
    public function destroyAll(): RedirectResponse
    {
        GoogleMapPlace::where('user_id', auth()->id())->delete();

        return redirect()->route('user.scraper.index')
            ->with('success', 'All scraping results deleted successfully.');
    }

    /**
     * Show WhatsApp contacts scraper page
     */
    public function contacts(): Response
    {
        // Sync session status with gateway
        $this->syncSessionStatus();

        // Get user's sessions for dropdown
        $sessions = WhatsappSession::where('user_id', auth()->id())
            ->select('id', 'session_id', 'name', 'status', 'phone_number')
            ->get();

        // Get scraped contacts for this user
        $contacts = \App\Models\WhatsappContact::where('user_id', auth()->id())
            ->with('session:id,name')
            ->latest()
            ->paginate(20)
            ->through(function ($contact) {
                return [
                    'id' => $contact->id,
                    'phone_number' => $contact->phone_number,
                    'display_name' => $contact->display_name ?: $contact->push_name ?: '-',
                    'session_name' => $contact->session->name ?? '-',
                    'created_at' => $contact->created_at ? $contact->created_at->format('d/m/Y H:i') : '-',
                ];
            });

        // Get stats
        $stats = [
            'total_contacts' => \App\Models\WhatsappContact::where('user_id', auth()->id())->count(),
            'with_name' => \App\Models\WhatsappContact::where('user_id', auth()->id())
                ->where(function ($q) {
                    $q->whereNotNull('display_name')->orWhereNotNull('push_name');
                })->count(),
        ];

        return Inertia::render('user/scraper/contacts', [
            'sessions' => $sessions,
            'contacts' => $contacts,
            'stats' => $stats,
        ]);
    }

    /**
     * Sync session status between database and gateway
     */
    private function syncSessionStatus(): void
    {
        try {
            $waGatewayUrl = config('services.whatsapp_gateway.url', 'http://localhost:3000');

            // Get user's sessions
            $userSessions = WhatsappSession::where('user_id', auth()->id())->get();

            foreach ($userSessions as $session) {
                try {
                    // Check specific session status via the new endpoint
                    $response = Http::timeout(3)->get("{$waGatewayUrl}/api/sessions/{$session->session_id}/status");

                    if ($response->successful()) {
                        $data = $response->json();
                        $isConnected = $data['data']['isConnected'] ?? false;

                        // Update status based on actual connection state
                        if ($isConnected && $session->status !== 'connected') {
                            $session->update(['status' => 'connected', 'is_active' => true]);
                        } elseif (!$isConnected && $session->status === 'connected') {
                            $session->update(['status' => 'disconnected', 'is_active' => false]);
                        }
                    }
                } catch (\Exception $e) {
                    // Skip this session if check fails
                    continue;
                }
            }
        } catch (\Exception $e) {
            // Silently fail - don't break page load if gateway is down
            Log::warning('Failed to sync session status: ' . $e->getMessage());
        }
    }

    /**
     * Show WhatsApp groups scraper page
     */
    public function groups(): Response
    {
        // Sync session status with gateway
        $this->syncSessionStatus();

        // Get user's sessions for dropdown
        $sessions = WhatsappSession::where('user_id', auth()->id())
            ->select('id', 'session_id', 'name', 'status', 'phone_number')
            ->get();

        // Get user's groups with session name
        $groups = WhatsappGroup::where('whatsapp_groups.user_id', auth()->id())
            ->join('whatsapp_sessions', 'whatsapp_groups.whatsapp_session_id', '=', 'whatsapp_sessions.id')
            ->select(
                'whatsapp_groups.id',
                'whatsapp_groups.group_jid',
                'whatsapp_groups.name',
                'whatsapp_groups.description',
                'whatsapp_groups.participants_count',
                'whatsapp_groups.admins_count',
                'whatsapp_groups.is_announce',
                'whatsapp_groups.is_locked',
                'whatsapp_groups.platform',
                'whatsapp_groups.created_at',
                'whatsapp_sessions.name as session_name'
            )
            ->orderBy('whatsapp_groups.created_at', 'desc')
            ->paginate(15);

        // Format dates to Indonesian friendly format
        $groups->getCollection()->transform(function ($group) {
            $group->formatted_date = $group->created_at
                ? \Carbon\Carbon::parse($group->created_at)->format('d/m/Y H:i')
                : '-';
            return $group;
        });

        // Get stats
        $stats = [
            'total_groups' => WhatsappGroup::where('user_id', auth()->id())->count(),
            'total_participants' => WhatsappGroup::where('user_id', auth()->id())->sum('participants_count'),
        ];

        return Inertia::render('user/scraper/groups', [
            'sessions' => $sessions,
            'groups' => $groups,
            'stats' => $stats,
        ]);
    }

    /**
     * Scrape members from a specific group
     */
    public function scrapeGroupMembers(Request $request, WhatsappGroup $group)
    {
        // Ensure user owns this group
        if ($group->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'error' => 'Akses tidak diizinkan',
            ], 403);
        }

        try {
            $waGatewayUrl = config('services.whatsapp_gateway.url', 'http://localhost:3000');

            $response = Http::timeout(60)->post("{$waGatewayUrl}/api/groups/members/{$group->id}/scrape", [
                'user_id' => auth()->id(),
            ]);

            if ($response->successful()) {
                $data = $response->json();
                return response()->json($data);
            }

            $errorData = $response->json();
            return response()->json([
                'success' => false,
                'error' => $errorData['error'] ?? 'Gagal mengambil anggota grup',
            ], $response->status());

        } catch (\Exception $e) {
            Log::error('Error scraping group members: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Gagal terhubung ke WhatsApp Gateway: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get members of a specific group
     */
    public function getGroupMembers(WhatsappGroup $group)
    {
        // Ensure user owns this group
        if ($group->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'error' => 'Akses tidak diizinkan',
            ], 403);
        }

        $members = WhatsappGroupMember::where('whatsapp_group_id', $group->id)
            ->orderByDesc('is_super_admin')
            ->orderByDesc('is_admin')
            ->orderBy('display_name')
            ->get()
            ->map(function ($member) {
                return [
                    'id' => $member->id,
                    'phone_number' => $member->phone_number,
                    'display_name' => $member->display_name ?: $member->push_name ?: '-',
                    'is_admin' => $member->is_admin,
                    'is_super_admin' => $member->is_super_admin,
                    'is_lid_format' => $member->is_lid_format,
                    'identifier' => $member->phone_number ?: ($member->is_lid_format ? 'LID' : $member->participant_jid),
                ];
            });

        return response()->json([
            'success' => true,
            'data' => [
                'group' => [
                    'id' => $group->id,
                    'name' => $group->name,
                    'participants_count' => $group->participants_count,
                ],
                'members' => $members,
                'stats' => [
                    'total' => $members->count(),
                    'with_phone' => $members->filter(fn($m) => $m['phone_number'] !== null)->count(),
                    'admins' => $members->filter(fn($m) => $m['is_admin'])->count(),
                ],
            ],
        ]);
    }

    /**
     * Scrape contacts from WhatsApp Cloud API (Meta)
     */
    public function scrapeMetaWhatsApp(Request $request)
    {
        $service = new MetaContactScraperService();
        $result = $service->fetchWhatsAppCloudContacts(auth()->id());

        return response()->json($result);
    }

    /**
     * Scrape contacts from Facebook Messenger
     */
    public function scrapeMetaFacebook(Request $request)
    {
        $service = new MetaContactScraperService();
        $result = $service->scrapeFacebookContacts(auth()->id());

        return response()->json($result);
    }

    /**
     * Scrape contacts from Instagram Direct
     */
    public function scrapeMetaInstagram(Request $request)
    {
        $service = new MetaContactScraperService();
        $result = $service->scrapeInstagramContacts(auth()->id());

        return response()->json($result);
    }

    /**
     * Get Meta contacts (for display in UI)
     */
    public function getMetaContacts(Request $request)
    {
        $platform = $request->query('platform'); // whatsapp_cloud, facebook, instagram

        $query = \App\Models\WhatsappContact::where('user_id', auth()->id());

        if ($platform) {
            $query->where('platform', $platform);
        } else {
            // Default to Meta-only platforms
            $query->whereIn('platform', ['whatsapp_cloud', 'facebook', 'instagram']);
        }

        $contacts = $query->latest()
            ->paginate(20)
            ->through(function ($contact) {
                return [
                    'id' => $contact->id,
                    'platform' => $contact->platform,
                    'identifier' => $contact->phone_number,
                    'name' => $contact->display_name ?: $contact->push_name ?: '-',
                    'username' => $contact->push_name,
                    'last_message_at' => $contact->updated_at ? $contact->updated_at->format('d/m/Y H:i') : '-',
                    'created_at' => $contact->created_at->format('d/m/Y H:i'),
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $contacts,
        ]);
    }

    /**
     * Get Meta contacts stats
     */
    public function getMetaContactsStats()
    {
        $stats = [
            'total' => \App\Models\WhatsappContact::where('user_id', auth()->id())->whereIn('platform', ['whatsapp_cloud', 'facebook', 'instagram'])->count(),
            'whatsapp' => \App\Models\WhatsappContact::where('user_id', auth()->id())->where('platform', 'whatsapp_cloud')->count(),
            'facebook' => \App\Models\WhatsappContact::where('user_id', auth()->id())->where('platform', 'facebook')->count(),
            'instagram' => \App\Models\WhatsappContact::where('user_id', auth()->id())->where('platform', 'instagram')->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }
}
