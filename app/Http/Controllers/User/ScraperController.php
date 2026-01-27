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
            'max_results' => 'nullable|integer|min:1|max:100',
        ]);

        $category = ScraperCategory::findOrFail($validated['category_id']);

        // Dispatch scraping job with user_id
        $jobId = uniqid('scrape_', true);

        ProcessGoogleMapsScraping::dispatch(
            auth()->id(),
            $category->name, // keyword
            $validated['location'],
            $validated['kecamatan'],
            $validated['max_results'] ?? 20,
            $jobId
        );

        // Return JSON response for AJAX requests
        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'status' => 'success',
                'message' => 'Scraping job started successfully',
                'job_id' => $jobId,
                'data' => [],
            ]);
        }

        return redirect()->route('user.scraper.index')
            ->with('success', 'Scraping job started. Results will appear shortly.');
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
