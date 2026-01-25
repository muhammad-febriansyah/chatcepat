<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\WhatsappContact;
use App\Models\WhatsappSession;
use App\Imports\WhatsappContactsImport;
use App\Traits\LogsActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Facades\Excel;
use Inertia\Inertia;

class ContactController extends Controller
{
    use LogsActivity;
    public function index(Request $request)
    {
        // Get user's sessions for dropdown
        $sessions = WhatsappSession::where('user_id', auth()->id())
            ->select('id', 'session_id', 'name', 'status')
            ->get();

        // Get total contacts count
        $totalContacts = WhatsappContact::where('user_id', auth()->id())->count();

        // Get contacts with display name count
        $contactsWithName = WhatsappContact::where('user_id', auth()->id())
            ->whereNotNull('display_name')
            ->count();

        // Get ready for broadcast (contacts that are not groups)
        $readyForBroadcast = WhatsappContact::where('user_id', auth()->id())
            ->where('is_group', false)
            ->count();

        // Get paginated contacts with search
        $query = WhatsappContact::where('user_id', auth()->id())
            ->with('session:id,session_id,name');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('phone_number', 'like', "%{$search}%")
                  ->orWhere('display_name', 'like', "%{$search}%")
                  ->orWhere('push_name', 'like', "%{$search}%");
            });
        }

        $contacts = $query->latest()
            ->paginate(10)
            ->through(function ($contact) {
                return [
                    'id' => $contact->id,
                    'phone_number' => $contact->phone_number,
                    'display_name' => $contact->display_name ?: $contact->push_name,
                    'session_name' => $contact->session->name ?? '-',
                    'is_group' => $contact->is_group,
                    'created_at' => $contact->created_at?->format('d/m/Y H:i') ?? '-',
                ];
            });

        return Inertia::render('user/contacts/index', [
            'contacts' => $contacts,
            'sessions' => $sessions,
            'stats' => [
                'total' => $totalContacts,
                'with_name' => $contactsWithName,
                'ready_broadcast' => $readyForBroadcast,
            ],
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('user/contacts/create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'phone_number' => 'required|string|max:100',
            'display_name' => 'nullable|string|max:255',
        ]);

        // Get user's first active session, or create a default one
        $session = WhatsappSession::where('user_id', auth()->id())->first();

        if (!$session) {
            return back()->withErrors([
                'session' => 'Anda perlu membuat WhatsApp session terlebih dahulu.'
            ]);
        }

        // Check if contact already exists
        $existingContact = WhatsappContact::where('whatsapp_session_id', $session->id)
            ->where('phone_number', $validated['phone_number'])
            ->first();

        if ($existingContact) {
            return back()->withErrors([
                'phone_number' => 'Nomor telepon ini sudah ada di kontak.'
            ]);
        }

        $contact = WhatsappContact::create([
            'user_id' => auth()->id(),
            'whatsapp_session_id' => $session->id,
            'phone_number' => $validated['phone_number'],
            'display_name' => $validated['display_name'],
        ]);

        $this->logActivity(
            action: 'create',
            resourceType: 'WhatsappContact',
            resourceId: $contact->id,
            resourceName: $contact->display_name ?: $contact->phone_number,
            newValues: $contact->toArray()
        );

        return redirect()->route('user.contacts.index')
            ->with('success', 'Kontak berhasil ditambahkan.');
    }

    public function edit(WhatsappContact $contact)
    {
        // Make sure contact belongs to user's session
        if ($contact->session->user_id !== auth()->id()) {
            abort(403);
        }

        return Inertia::render('user/contacts/edit', [
            'contact' => [
                'id' => $contact->id,
                'phone_number' => $contact->phone_number,
                'display_name' => $contact->display_name,
                'created_at' => $contact->created_at?->toISOString(),
            ],
        ]);
    }

    public function update(Request $request, WhatsappContact $contact)
    {
        // Make sure contact belongs to user's session
        if ($contact->session->user_id !== auth()->id()) {
            abort(403);
        }

        $validated = $request->validate([
            'phone_number' => 'required|string|max:100',
            'display_name' => 'nullable|string|max:255',
        ]);

        // Check if phone number already exists (excluding current contact)
        $existingContact = WhatsappContact::where('whatsapp_session_id', $contact->whatsapp_session_id)
            ->where('phone_number', $validated['phone_number'])
            ->where('id', '!=', $contact->id)
            ->first();

        if ($existingContact) {
            return back()->withErrors([
                'phone_number' => 'Nomor telepon ini sudah ada di kontak.'
            ]);
        }

        $oldValues = $contact->toArray();
        $contact->update($validated);

        $this->logActivity(
            action: 'update',
            resourceType: 'WhatsappContact',
            resourceId: $contact->id,
            resourceName: $contact->display_name ?: $contact->phone_number,
            oldValues: $oldValues,
            newValues: $contact->fresh()->toArray()
        );

        return redirect()->route('user.contacts.index')
            ->with('success', 'Kontak berhasil diperbarui.');
    }

    public function destroy(WhatsappContact $contact)
    {
        // Make sure contact belongs to user's session
        if ($contact->session->user_id !== auth()->id()) {
            abort(403);
        }

        $this->logActivity(
            action: 'delete',
            resourceType: 'WhatsappContact',
            resourceId: $contact->id,
            resourceName: $contact->display_name ?: $contact->phone_number,
            oldValues: $contact->toArray()
        );

        $contact->delete();

        return redirect()->route('user.contacts.index')
            ->with('success', 'Kontak berhasil dihapus.');
    }

    /**
     * Check scraping status for a session
     */
    public function checkScrapingStatus(Request $request)
    {
        $request->validate([
            'session_id' => 'required|string',
        ]);

        $session = WhatsappSession::where('user_id', auth()->id())
            ->where('session_id', $request->session_id)
            ->firstOrFail();

        try {
            $waGatewayUrl = config('services.whatsapp_gateway.url', 'http://localhost:3000');

            $response = Http::timeout(10)
                ->get("{$waGatewayUrl}/api/contacts/{$request->session_id}/status");

            if ($response->successful()) {
                return response()->json($response->json());
            }

            return response()->json([
                'success' => false,
                'error' => 'Failed to check scraping status',
            ], 500);
        } catch (\Exception $e) {
            Log::error('Error checking scraping status: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'WhatsApp Gateway tidak dapat dihubungi. Pastikan service berjalan.',
            ], 500);
        }
    }

    /**
     * Scrape contacts from WhatsApp session
     */
    public function scrapeContacts(Request $request)
    {
        // Extend PHP execution time for long-running scraping process
        set_time_limit(180); // 3 minutes

        $request->validate([
            'session_id' => 'required|string',
        ]);

        // Verify session belongs to user
        $session = WhatsappSession::where('user_id', auth()->id())
            ->where('session_id', $request->session_id)
            ->firstOrFail();

        try {
            $waGatewayUrl = config('services.whatsapp_gateway.url', 'http://localhost:3000');

            // Verify session is connected in gateway before scraping
            // Use the specific session status endpoint (not the list endpoint)
            $sessionCheckResponse = Http::timeout(10)->get("{$waGatewayUrl}/api/sessions/{$request->session_id}/status");

            if ($sessionCheckResponse->successful()) {
                $gatewayData = $sessionCheckResponse->json();
                $isConnected = $gatewayData['data']['isConnected'] ?? false;

                if (!$isConnected) {
                    // Sync database status with gateway
                    $gatewayStatus = $gatewayData['data']['status'] ?? 'disconnected';
                    if ($session->status !== $gatewayStatus) {
                        $session->update(['status' => $gatewayStatus, 'is_active' => false]);
                    }

                    return response()->json([
                        'success' => false,
                        'error' => 'Session tidak terhubung ke WhatsApp. Silakan hubungkan kembali session dengan scan QR code di halaman WhatsApp Management.',
                    ], 400);
                }
            } elseif ($sessionCheckResponse->status() === 404) {
                // Session not found in gateway
                $session->update(['status' => 'disconnected', 'is_active' => false]);

                return response()->json([
                    'success' => false,
                    'error' => 'Session tidak ditemukan di WhatsApp Gateway. Silakan hubungkan kembali session.',
                ], 400);
            }

            // Call WhatsApp Gateway API to scrape contacts
            // Pass user_id so Express.js can verify session ownership
            $response = Http::timeout(120) // 2 minutes timeout for scraping
                ->post("{$waGatewayUrl}/api/contacts/{$request->session_id}/scrape", [
                    'user_id' => auth()->id(),
                ]);

            $data = $response->json();

            if ($response->successful() && ($data['success'] ?? false)) {
                // Contacts are already saved by the gateway
                // Just return success message
                return response()->json([
                    'success' => true,
                    'message' => $data['message'] ?? 'Contacts scraped successfully',
                    'data' => [
                        'total_scraped' => $data['data']['totalScraped'] ?? 0,
                        'total_saved' => $data['data']['totalSaved'] ?? 0,
                    ],
                ]);
            }

            // Handle error responses (including rate limit 429)
            $errorMessage = $data['error'] ?? 'Failed to scrape contacts';

            // Translate common error messages to Indonesian
            if (str_contains($errorMessage, 'wait') && str_contains($errorMessage, 'minutes')) {
                preg_match('/(\d+)\s*minutes/', $errorMessage, $matches);
                $minutes = $matches[1] ?? '?';
                $errorMessage = "Mohon tunggu {$minutes} menit sebelum melakukan scraping lagi. Ini untuk mencegah pemblokiran akun WhatsApp Anda.";
            } elseif (str_contains($errorMessage, 'Daily scraping limit')) {
                $errorMessage = "Batas scraping harian tercapai. Silakan coba lagi besok.";
            }

            return response()->json([
                'success' => false,
                'error' => $errorMessage,
            ], $response->status());
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('WhatsApp Gateway connection error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'WhatsApp Gateway tidak dapat dihubungi. Pastikan service berjalan di http://localhost:3000',
            ], 500);
        } catch (\Exception $e) {
            Log::error('Error scraping contacts: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get scraping history
     */
    public function scrapingHistory()
    {
        try {
            $waGatewayUrl = config('services.whatsapp_gateway.url', 'http://localhost:3000');

            $response = Http::timeout(10)
                ->get("{$waGatewayUrl}/api/contacts/history/all");

            if ($response->successful()) {
                return response()->json($response->json());
            }

            return response()->json([
                'success' => false,
                'error' => 'Failed to get scraping history',
            ], 500);
        } catch (\Exception $e) {
            Log::error('Error getting scraping history: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'WhatsApp Gateway tidak dapat dihubungi',
            ], 500);
        }
    }

    /**
     * Reset scraping cooldown for testing purposes
     */
    public function resetScrapingCooldown(Request $request)
    {
        $request->validate([
            'session_id' => 'required|string',
        ]);

        // Verify session belongs to user
        $session = WhatsappSession::where('user_id', auth()->id())
            ->where('session_id', $request->session_id)
            ->firstOrFail();

        try {
            $waGatewayUrl = config('services.whatsapp_gateway.url', 'http://localhost:3000');

            $response = Http::timeout(10)
                ->post("{$waGatewayUrl}/api/contacts/{$request->session_id}/reset-cooldown", [
                    'user_id' => auth()->id(),
                ]);

            if ($response->successful()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Cooldown scraping berhasil direset. Anda bisa melakukan scraping lagi.',
                ]);
            }

            return response()->json([
                'success' => false,
                'error' => 'Gagal reset cooldown: ' . ($response->json()['error'] ?? 'Unknown error'),
            ], 500);
        } catch (\Exception $e) {
            Log::error('Error resetting scraping cooldown: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'WhatsApp Gateway tidak dapat dihubungi',
            ], 500);
        }
    }

    /**
     * Scrape groups from WhatsApp session
     */
    public function scrapeGroups(Request $request)
    {
        // Extend PHP execution time for long-running scraping process
        set_time_limit(180); // 3 minutes

        $request->validate([
            'session_id' => 'required|string',
        ]);

        // Verify session belongs to user
        $session = WhatsappSession::where('user_id', auth()->id())
            ->where('session_id', $request->session_id)
            ->firstOrFail();

        try {
            $waGatewayUrl = config('services.whatsapp_gateway.url', 'http://localhost:3000');

            // Call WhatsApp Gateway API to scrape groups
            // Pass user_id so Express.js can verify session ownership
            $response = Http::timeout(120) // 2 minutes timeout for scraping
                ->post("{$waGatewayUrl}/api/groups/{$request->session_id}/scrape", [
                    'user_id' => auth()->id(),
                ]);

            if ($response->successful()) {
                $data = $response->json();

                if ($data['success']) {
                    return response()->json([
                        'success' => true,
                        'message' => $data['message'] ?? 'Groups scraped successfully',
                        'data' => [
                            'total_scraped' => $data['data']['totalScraped'] ?? 0,
                            'total_saved' => $data['data']['totalSaved'] ?? 0,
                        ],
                    ]);
                }

                return response()->json([
                    'success' => false,
                    'error' => $data['error'] ?? 'Failed to scrape groups',
                ], 500);
            }

            // Try to get error message from response body
            $data = $response->json();
            $errorMessage = $data['error'] ?? 'Failed to communicate with WhatsApp Gateway';

            return response()->json([
                'success' => false,
                'error' => $errorMessage,
            ], $response->status());
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('WhatsApp Gateway connection error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'WhatsApp Gateway tidak dapat dihubungi. Pastikan service berjalan di http://localhost:3000',
            ], 500);
        } catch (\Exception $e) {
            Log::error('Error scraping groups: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Import contacts from Excel/CSV file
     */
    public function importExcel(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv|max:10240', // Max 10MB
            'session_id' => 'required|exists:whatsapp_sessions,id',
        ]);

        // Verify session belongs to user
        $session = WhatsappSession::where('user_id', auth()->id())
            ->where('id', $request->session_id)
            ->first();

        if (!$session) {
            return response()->json([
                'success' => false,
                'error' => 'Session tidak ditemukan atau bukan milik Anda.',
            ], 403);
        }

        try {
            $import = new WhatsappContactsImport(auth()->id(), $session->id);
            Excel::import($import, $request->file('file'));

            $imported = $import->getImportedCount();
            $skipped = $import->getSkippedCount();

            return response()->json([
                'success' => true,
                'message' => "Berhasil import {$imported} kontak. {$skipped} kontak dilewati (sudah ada atau tidak valid).",
                'data' => [
                    'imported' => $imported,
                    'skipped' => $skipped,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Error importing contacts: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Gagal import kontak: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Download sample Excel template for import
     */
    public function downloadTemplate()
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="template_kontak_whatsapp.csv"',
        ];

        $columns = ['phone_number', 'display_name'];
        $examples = [
            ['6281234567890', 'John Doe'],
            ['6289876543210', 'Jane Doe'],
            ['08123456789', 'Ahmad (akan otomatis jadi 628123456789)'],
        ];

        $callback = function() use ($columns, $examples) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);
            foreach ($examples as $row) {
                fputcsv($file, $row);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
