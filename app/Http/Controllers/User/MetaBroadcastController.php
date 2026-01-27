<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\MetaBroadcast;
use App\Models\MetaContact;
use App\Models\MetaContactGroup;
use App\Models\MetaBroadcastMessage;
use App\Services\Meta\WhatsAppBusinessService;
use App\Services\Meta\InstagramMessagingService;
use App\Services\Meta\FacebookMessengerService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class MetaBroadcastController extends Controller
{
    /**
     * Display broadcasts list
     */
    public function index(Request $request): Response
    {
        $user = auth()->user();

        $broadcasts = MetaBroadcast::where('user_id', $user->id)
            ->when($request->platform, fn($q, $platform) => $q->where('platform', $platform))
            ->when($request->status, fn($q, $status) => $q->where('status', $status))
            ->when($request->search, fn($q, $search) => $q->where('name', 'like', "%{$search}%"))
            ->with('messages')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('user/meta/broadcast/index', [
            'broadcasts' => $broadcasts,
            'filters' => $request->only(['platform', 'status', 'search']),
        ]);
    }

    /**
     * Show create form
     */
    public function create(): Response
    {
        $user = auth()->user();

        $contactGroups = MetaContactGroup::where('user_id', $user->id)
            ->withCount('contacts')
            ->get();

        return Inertia::render('user/meta/broadcast/create', [
            'contactGroups' => $contactGroups,
        ]);
    }

    /**
     * Store new broadcast
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'platform' => 'required|in:whatsapp,instagram,facebook',
            'name' => 'required|string|max:255',
            'message_type' => 'required|in:text,image,video,audio,document,template',
            'message_content' => 'required_if:message_type,text|nullable|string',
            'media_url' => 'nullable|url',
            'media_caption' => 'nullable|string',
            'template_name' => 'nullable|string',
            'template_data' => 'nullable|array',
            'recipient_type' => 'required|in:all,groups,contacts',
            'recipient_groups' => 'nullable|array',
            'recipient_contacts' => 'nullable|array',
            'schedule_type' => 'required|in:now,scheduled',
            'scheduled_at' => 'required_if:schedule_type,scheduled|nullable|date|after:now',
        ]);

        $validated['user_id'] = auth()->id();
        $validated['status'] = $request->schedule_type === 'now' ? 'processing' : 'scheduled';

        // Calculate total recipients
        $validated['total_recipients'] = $this->calculateRecipients(
            $validated['recipient_type'],
            $validated['recipient_groups'] ?? [],
            $validated['recipient_contacts'] ?? [],
            $validated['platform']
        );

        $broadcast = MetaBroadcast::create($validated);

        // Process immediately if sending now
        if ($request->schedule_type === 'now') {
            dispatch(function () use ($broadcast) {
                app(MetaBroadcastController::class)->processBroadcast($broadcast);
            })->afterResponse();
        }

        return redirect()
            ->route('user.meta.broadcast.index')
            ->with('success', 'Broadcast created successfully');
    }

    /**
     * Show broadcast details
     */
    public function show(MetaBroadcast $broadcast): Response
    {
        $this->authorize('view', $broadcast);

        $broadcast->load(['messages' => function ($query) {
            $query->with('contact')->orderBy('created_at', 'desc');
        }]);

        return Inertia::render('user/meta/broadcast/show', [
            'broadcast' => $broadcast,
        ]);
    }

    /**
     * Cancel scheduled broadcast
     */
    public function cancel(MetaBroadcast $broadcast): RedirectResponse
    {
        $this->authorize('update', $broadcast);

        if (!in_array($broadcast->status, ['draft', 'scheduled'])) {
            return back()->with('error', 'Cannot cancel this broadcast');
        }

        $broadcast->update(['status' => 'cancelled']);

        return back()->with('success', 'Broadcast cancelled successfully');
    }

    /**
     * Delete broadcast
     */
    public function destroy(MetaBroadcast $broadcast): RedirectResponse
    {
        $this->authorize('delete', $broadcast);

        $broadcast->delete();

        return redirect()
            ->route('user.meta.broadcast.index')
            ->with('success', 'Broadcast deleted successfully');
    }

    /**
     * Process broadcast (send messages)
     */
    public function processBroadcast(MetaBroadcast $broadcast): void
    {
        try {
            $broadcast->markAsProcessing();

            // Get recipients
            $contacts = $this->getRecipients(
                $broadcast->recipient_type,
                $broadcast->recipient_groups ?? [],
                $broadcast->recipient_contacts ?? [],
                $broadcast->platform,
                $broadcast->user_id
            );

            // Create broadcast message records
            foreach ($contacts as $contact) {
                MetaBroadcastMessage::create([
                    'broadcast_id' => $broadcast->id,
                    'contact_id' => $contact->id,
                    'recipient_identifier' => $contact->identifier,
                    'status' => 'pending',
                ]);
            }

            // Send messages based on platform
            $service = $this->getServiceForPlatform($broadcast->platform);

            foreach ($contacts as $contact) {
                try {
                    $response = $this->sendBroadcastMessage($service, $broadcast, $contact);

                    $broadcastMessage = MetaBroadcastMessage::where('broadcast_id', $broadcast->id)
                        ->where('contact_id', $contact->id)
                        ->first();

                    if ($response['success']) {
                        $broadcastMessage->update([
                            'status' => 'sent',
                            'meta_message_id' => $response['message_id'] ?? null,
                            'sent_at' => now(),
                        ]);
                    } else {
                        $broadcastMessage->update([
                            'status' => 'failed',
                            'error_message' => $response['error'] ?? 'Unknown error',
                        ]);
                    }

                    // Rate limiting: sleep 1 second between messages
                    sleep(1);

                } catch (\Exception $e) {
                    $broadcastMessage = MetaBroadcastMessage::where('broadcast_id', $broadcast->id)
                        ->where('contact_id', $contact->id)
                        ->first();

                    $broadcastMessage->update([
                        'status' => 'failed',
                        'error_message' => $e->getMessage(),
                    ]);
                }
            }

            // Update broadcast statistics
            $broadcast->updateStats();
            $broadcast->markAsCompleted();

        } catch (\Exception $e) {
            $broadcast->markAsFailed($e->getMessage());
        }
    }

    /**
     * Send individual broadcast message
     */
    protected function sendBroadcastMessage($service, MetaBroadcast $broadcast, MetaContact $contact): array
    {
        return match ($broadcast->message_type) {
            'text' => $service->sendTextMessage(
                $contact->identifier,
                $broadcast->message_content,
                $broadcast->user_id
            ),
            'template' => $service->sendTemplateMessage(
                $contact->identifier,
                $broadcast->template_name,
                $broadcast->template_data ?? [],
                $broadcast->user_id
            ),
            default => $service->sendMediaMessage(
                $contact->identifier,
                $broadcast->message_type,
                $broadcast->media_url,
                $broadcast->media_caption,
                $broadcast->user_id
            ),
        };
    }

    /**
     * Get service for platform
     */
    protected function getServiceForPlatform(string $platform)
    {
        return match ($platform) {
            'whatsapp' => new WhatsAppBusinessService(),
            'instagram' => new InstagramMessagingService(),
            'facebook' => new FacebookMessengerService(),
        };
    }

    /**
     * Calculate total recipients
     */
    protected function calculateRecipients(string $type, array $groups, array $contacts, string $platform): int
    {
        if ($type === 'all') {
            return MetaContact::where('platform', $platform)
                ->where('is_blocked', false)
                ->count();
        }

        if ($type === 'groups') {
            return DB::table('meta_contact_group_members')
                ->whereIn('group_id', $groups)
                ->distinct('contact_id')
                ->count('contact_id');
        }

        return count($contacts);
    }

    /**
     * Get recipients
     */
    protected function getRecipients(string $type, array $groups, array $contactIds, string $platform, int $userId)
    {
        $query = MetaContact::where('user_id', $userId)
            ->where('platform', $platform)
            ->where('is_blocked', false);

        if ($type === 'all') {
            return $query->get();
        }

        if ($type === 'groups') {
            return $query->whereHas('groups', function ($q) use ($groups) {
                $q->whereIn('meta_contact_groups.id', $groups);
            })->get();
        }

        return $query->whereIn('id', $contactIds)->get();
    }
}
