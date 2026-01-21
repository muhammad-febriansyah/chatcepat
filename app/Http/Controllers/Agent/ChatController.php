<?php

namespace App\Http\Controllers\Agent;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\ConversationMessage;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;

class ChatController extends Controller
{
    /**
     * Display the chat inbox.
     */
    public function index(): Response
    {
        $agent = Auth::guard('agent')->user();

        // Get conversations assigned to this agent
        $conversations = Conversation::with(['whatsappSession', 'latestMessage'])
            ->where('human_agent_id', $agent->id)
            ->whereIn('status', ['open', 'pending'])
            ->orderBy('last_message_at', 'desc')
            ->get();

        return Inertia::render('agent/chat/inbox', [
            'agent' => $agent,
            'conversations' => $conversations,
        ]);
    }

    /**
     * Get messages for a specific conversation.
     */
    public function getMessages(Conversation $conversation): JsonResponse
    {
        $agent = Auth::guard('agent')->user();

        // Verify agent has access to this conversation
        if ($conversation->human_agent_id !== $agent->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $messages = $conversation->messages()
            ->with('humanAgent')
            ->orderBy('created_at', 'asc')
            ->get();

        // Mark conversation as read
        $conversation->markAsRead();

        return response()->json([
            'conversation' => $conversation->load('whatsappSession'),
            'messages' => $messages,
        ]);
    }

    /**
     * Send a message to customer.
     */
    public function sendMessage(Request $request, Conversation $conversation): JsonResponse
    {
        $agent = Auth::guard('agent')->user();

        // Verify agent has access to this conversation
        if ($conversation->human_agent_id !== $agent->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'message' => 'required|string',
            'message_type' => 'sometimes|string|in:text,image,document,audio,video',
        ]);

        // Send message via WA Gateway
        try {
            $waGatewayUrl = env('WA_GATEWAY_URL', 'http://localhost:3000');
            $whatsappSession = $conversation->whatsappSession;

            $response = Http::post("{$waGatewayUrl}/api/send-message", [
                'sessionId' => $whatsappSession->session_id,
                'to' => $conversation->customer_phone,
                'message' => $validated['message'],
                'type' => $validated['message_type'] ?? 'text',
            ]);

            if (!$response->successful()) {
                return response()->json([
                    'success' => false,
                    'error' => 'Failed to send message via WhatsApp',
                ], 500);
            }

            $messageId = $response->json('messageId', 'agent_' . uniqid());
        } catch (\Exception $e) {
            \Log::error('Failed to send message via WA Gateway: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to send message: ' . $e->getMessage(),
            ], 500);
        }

        $message = ConversationMessage::create([
            'conversation_id' => $conversation->id,
            'message_id' => $messageId,
            'direction' => 'outbound',
            'message_text' => $validated['message'],
            'message_type' => $validated['message_type'] ?? 'text',
            'human_agent_id' => $agent->id,
            'is_read' => true,
            'read_at' => now(),
        ]);

        // Update conversation last message
        $conversation->update([
            'last_message_at' => now(),
            'last_message_text' => $validated['message'],
            'last_message_from' => 'agent',
        ]);

        return response()->json([
            'success' => true,
            'message' => $message,
        ]);
    }

    /**
     * Update conversation status.
     */
    public function updateStatus(Request $request, Conversation $conversation): JsonResponse
    {
        $agent = Auth::guard('agent')->user();

        // Verify agent has access to this conversation
        if ($conversation->human_agent_id !== $agent->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'status' => 'required|in:open,pending,resolved,closed',
        ]);

        $conversation->update([
            'status' => $validated['status'],
        ]);

        return response()->json([
            'success' => true,
            'conversation' => $conversation,
        ]);
    }

    /**
     * Get all conversations (with filters).
     */
    public function getConversations(Request $request): JsonResponse
    {
        $agent = Auth::guard('agent')->user();

        $query = Conversation::with(['whatsappSession', 'latestMessage'])
            ->where('human_agent_id', $agent->id);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by unread
        if ($request->boolean('unread_only')) {
            $query->where('unread_by_agent', true);
        }

        // Search by customer name/phone
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('customer_name', 'like', "%{$search}%")
                  ->orWhere('customer_phone', 'like', "%{$search}%");
            });
        }

        $conversations = $query->orderBy('last_message_at', 'desc')
            ->paginate(20);

        return response()->json($conversations);
    }

    /**
     * Transfer conversation to another agent.
     */
    public function transferConversation(Request $request, Conversation $conversation): JsonResponse
    {
        $agent = Auth::guard('agent')->user();

        // Verify current agent has access
        if ($conversation->human_agent_id !== $agent->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'target_agent_id' => 'required|exists:human_agents,id',
        ]);

        $conversation->update([
            'human_agent_id' => $validated['target_agent_id'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Percakapan berhasil ditransfer',
        ]);
    }
}
