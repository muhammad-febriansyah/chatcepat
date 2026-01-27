<?php

namespace App\Services\Meta;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\WhatsappContact;
use App\Models\WhatsappGroup;
use App\Models\WhatsappSession;
use App\Models\User;

class MetaContactScraperService
{
    /**
     * Fetch contacts from WhatsApp Cloud API (via conversations)
     */
    public function fetchWhatsAppCloudContacts(int $userId): array
    {
        $user = User::find($userId);

        if (!$user || !$user->meta_whatsapp_phone_number_id || !$user->meta_access_token) {
            return [
                'success' => false,
                'error' => 'WhatsApp Cloud API belum dikonfigurasi. Silakan setup di Meta Settings terlebih dahulu.',
            ];
        }

        try {
            $phoneNumberId = $user->meta_whatsapp_phone_number_id;
            $accessToken = $user->meta_access_token;
            $apiVersion = config('meta.whatsapp.api_version', 'v21.0');
            $totalScraped = 0;
            $totalSaved = 0;

            // Get user's first WhatsApp session or create a dummy/default one if needed
            // The scraper UI usually requires a session, but for Cloud API we just need a reference
            $session = WhatsappSession::where('user_id', $userId)->first();
            if (!$session) {
                return [
                    'success' => false,
                    'error' => 'Anda perlu membuat WhatsApp session terlebih dahulu sebagai basis penyimpanan kontak.',
                ];
            }

            // Get recent conversations from WhatsApp Business API
            $url = "https://graph.facebook.com/{$apiVersion}/{$phoneNumberId}/conversations";

            $response = Http::timeout(30)
                ->withToken($accessToken)
                ->get($url, [
                    'limit' => 100
                ]);

            if (!$response->successful()) {
                $error = $response->json()['error']['message'] ?? 'Unknown error';
                return [
                    'success' => false,
                    'error' => 'WhatsApp Cloud API Error: ' . $error,
                ];
            }

            $data = $response->json();
            $conversations = $data['data'] ?? [];

            foreach ($conversations as $conversation) {
                // Conversations usually give us the 'id' which for WA is the phone number
                // Sometimes it's structured differently
                $identifier = $conversation['id'] ?? null;
                if (!$identifier)
                    continue;

                // Clean-up identifier if it contains letters (WA identifiers are usually just numbers)
                $phoneNumber = preg_replace('/[^0-9]/', '', $identifier);
                if (empty($phoneNumber))
                    continue;

                $totalScraped++;

                // Save to WhatsappContact
                WhatsappContact::updateOrCreate(
                    [
                        'user_id' => $userId,
                        'phone_number' => $phoneNumber,
                        'platform' => 'whatsapp_cloud',
                    ],
                    [
                        'whatsapp_session_id' => $session->id,
                        'display_name' => $conversation['name'] ?? null,
                    ]
                );

                $totalSaved++;
            }

            return [
                'success' => true,
                'message' => "Berhasil mengambil {$totalSaved} kontak dari WhatsApp Cloud API",
                'data' => [
                    'totalScraped' => $totalScraped,
                    'totalSaved' => $totalSaved,
                ],
            ];

        } catch (\Exception $e) {
            Log::error('Error fetching WhatsApp Cloud contacts: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Gagal mengambil kontak: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Fetch active groups from WhatsApp Business API
     * Requires Official Business Account (OBA) status
     */
    public function fetchWhatsAppCloudGroups(int $userId): array
    {
        $user = User::find($userId);

        if (!$user || !$user->meta_whatsapp_phone_number_id || !$user->meta_access_token) {
            return [
                'success' => false,
                'error' => 'WhatsApp Cloud API belum dikonfigurasi. Silakan setup di Meta Settings terlebih dahulu.',
            ];
        }

        try {
            $phoneNumberId = $user->meta_whatsapp_phone_number_id;
            $accessToken = $user->meta_access_token;
            $apiVersion = config('meta.whatsapp.api_version', 'v21.0');
            $totalScraped = 0;
            $totalSaved = 0;

            $session = WhatsappSession::where('user_id', $userId)->first();
            if (!$session) {
                return [
                    'success' => false,
                    'error' => 'Anda perlu membuat WhatsApp session terlebih dahulu sebagai basis penyimpanan grup.',
                ];
            }

            // WhatsApp Business API endpoint for groups
            // Note: This endpoint is only available for OBAs
            $url = "https://graph.facebook.com/{$apiVersion}/{$phoneNumberId}/groups";

            $response = Http::timeout(30)
                ->withToken($accessToken)
                ->get($url);

            if (!$response->successful()) {
                $errorData = $response->json();
                $errorMsg = $errorData['error']['message'] ?? 'Unknown error';

                // Specifically check for permission error which usually means not an OBA
                if ($response->status() === 403 || str_contains(strtolower($errorMsg), 'permission')) {
                    return [
                        'success' => false,
                        'error' => 'Fitur Group Management hanya tersedia untuk Official Business Account (OBA). Pastikan akun Anda sudah terverifikasi oleh Meta.',
                    ];
                }

                return [
                    'success' => false,
                    'error' => 'WhatsApp Cloud API Error: ' . $errorMsg,
                ];
            }

            $data = $response->json();
            $groups = $data['data'] ?? [];

            foreach ($groups as $groupData) {
                $totalScraped++;

                // Save to WhatsappGroup
                WhatsappGroup::updateOrCreate(
                    [
                        'user_id' => $userId,
                        'group_jid' => $groupData['id'],
                        'platform' => 'whatsapp_cloud',
                    ],
                    [
                        'whatsapp_session_id' => $session->id,
                        'name' => $groupData['subject'] ?? 'Untitled Group',
                        'description' => $groupData['description'] ?? null,
                    ]
                );

                $totalSaved++;
            }

            return [
                'success' => true,
                'message' => "Berhasil mengambil {$totalSaved} grup dari WhatsApp Cloud API",
                'data' => [
                    'totalScraped' => $totalScraped,
                    'totalSaved' => $totalSaved,
                ],
            ];

        } catch (\Exception $e) {
            Log::error('Error fetching WhatsApp Cloud groups: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Gagal mengambil grup: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Fetch friends/contacts from Facebook Messenger Conversations
     */
    public function scrapeFacebookContacts(int $userId): array
    {
        $user = User::find($userId);

        if (!$user || !$user->meta_facebook_page_id || !$user->meta_facebook_page_access_token) {
            return [
                'success' => false,
                'error' => 'Facebook Page belum dikonfigurasi. Silakan setup di Meta Settings.',
            ];
        }

        try {
            $pageId = $user->meta_facebook_page_id;
            $accessToken = $user->meta_facebook_page_access_token;
            $apiVersion = config('meta.facebook.api_version', 'v21.0');
            $totalScraped = 0;
            $totalSaved = 0;

            $session = WhatsappSession::where('user_id', $userId)->first();
            if (!$session) {
                return [
                    'success' => false,
                    'error' => 'Anda perlu membuat WhatsApp session terlebih dahulu sebagai basis penyimpanan kontak.',
                ];
            }

            // For Facebook Pages, we get contacts from conversations
            $url = "https://graph.facebook.com/{$apiVersion}/{$pageId}/conversations";

            $response = Http::timeout(30)
                ->get($url, [
                    'access_token' => $accessToken,
                    'fields' => 'participants,updated_time',
                    'limit' => 100
                ]);

            if (!$response->successful()) {
                $error = $response->json()['error']['message'] ?? 'Unknown error';
                return [
                    'success' => false,
                    'error' => 'Facebook API Error: ' . $error,
                ];
            }

            $data = $response->json();
            $conversations = $data['data'] ?? [];

            foreach ($conversations as $conversation) {
                $participants = $conversation['participants']['data'] ?? [];

                foreach ($participants as $participant) {
                    // Skip the page itself
                    if ($participant['id'] === $pageId)
                        continue;

                    $totalScraped++;

                    // Save to WhatsappContact
                    WhatsappContact::updateOrCreate(
                        [
                            'user_id' => $userId,
                            'phone_number' => 'fb_' . $participant['id'],
                            'platform' => 'facebook',
                        ],
                        [
                            'whatsapp_session_id' => $session->id,
                            'display_name' => $participant['name'] ?? null,
                            'push_name' => $participant['name'] ?? null,
                        ]
                    );

                    $totalSaved++;
                }
            }

            return [
                'success' => true,
                'message' => "Berhasil mengambil {$totalSaved} kontak dari Facebook Messenger",
                'data' => [
                    'totalScraped' => $totalScraped,
                    'totalSaved' => $totalSaved,
                ],
            ];

        } catch (\Exception $e) {
            Log::error('Error scraping Facebook contacts: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Gagal scraping Facebook: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Fetch Instagram contacts from Direct Messages
     */
    public function scrapeInstagramContacts(int $userId): array
    {
        $user = User::find($userId);

        if (!$user || !$user->meta_instagram_account_id || !$user->meta_access_token) {
            return [
                'success' => false,
                'error' => 'Instagram Business belum dikonfigurasi. Silakan setup di Meta Settings.',
            ];
        }

        try {
            $instagramAccountId = $user->meta_instagram_account_id;
            $accessToken = $user->meta_access_token;
            $apiVersion = config('meta.instagram.api_version', 'v21.0');
            $totalScraped = 0;
            $totalSaved = 0;

            $session = WhatsappSession::where('user_id', $userId)->first();
            if (!$session) {
                return [
                    'success' => false,
                    'error' => 'Anda perlu membuat WhatsApp session terlebih dahulu sebagai basis penyimpanan kontak.',
                ];
            }

            // For Instagram Business, we get contacts from direct conversations
            $url = "https://graph.facebook.com/{$apiVersion}/{$instagramAccountId}/conversations";

            $response = Http::timeout(30)
                ->get($url, [
                    'access_token' => $accessToken,
                    'fields' => 'participants,updated_time',
                    'limit' => 100,
                    'platform' => 'instagram'
                ]);

            if (!$response->successful()) {
                $error = $response->json()['error']['message'] ?? 'Unknown error';
                return [
                    'success' => false,
                    'error' => 'Instagram API Error: ' . $error,
                ];
            }

            $data = $response->json();
            $conversations = $data['data'] ?? [];

            foreach ($conversations as $conversation) {
                $participants = $conversation['participants']['data'] ?? [];

                foreach ($participants as $participant) {
                    // Skip the IG account itself
                    if ($participant['id'] === $instagramAccountId)
                        continue;

                    $totalScraped++;

                    // Save to WhatsappContact
                    WhatsappContact::updateOrCreate(
                        [
                            'user_id' => $userId,
                            'phone_number' => 'ig_' . $participant['id'],
                            'platform' => 'instagram',
                        ],
                        [
                            'whatsapp_session_id' => $session->id,
                            'display_name' => $participant['name'] ?? $participant['username'] ?? null,
                            'push_name' => $participant['username'] ?? null,
                        ]
                    );

                    $totalSaved++;
                }
            }

            return [
                'success' => true,
                'message' => "Berhasil mengambil {$totalSaved} kontak dari Instagram Direct",
                'data' => [
                    'totalScraped' => $totalScraped,
                    'totalSaved' => $totalSaved,
                ],
            ];

        } catch (\Exception $e) {
            Log::error('Error scraping Instagram contacts: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Gagal scraping Instagram: ' . $e->getMessage(),
            ];
        }
    }
}
