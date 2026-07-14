<?php

namespace App\Http\Controllers;

use App\Http\Resources\MessageResource;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * MessageController
 *
 * Handles 1-to-1 messaging between coaches and students.
 * Simple polling-based approach (not real-time).
 */
class MessageController extends Controller
{
    /**
     * Get conversation with a specific user.
     * GET /api/messages/{userId}
     */
    public function conversation(Request $request, int $userId): JsonResponse
    {
        $authUser = $request->user();

        // Get all messages between the two users, in chronological order
        $messages = Message::where(function ($q) use ($authUser, $userId) {
                $q->where('sender_id', $authUser->id)->where('receiver_id', $userId);
            })
            ->orWhere(function ($q) use ($authUser, $userId) {
                $q->where('sender_id', $userId)->where('receiver_id', $authUser->id);
            })
            ->with(['sender', 'receiver'])
            ->orderBy('created_at')
            ->paginate(50);

        // Mark incoming messages as read when the conversation is viewed
        Message::where('sender_id', $userId)
               ->where('receiver_id', $authUser->id)
               ->whereNull('read_at')
               ->update(['read_at' => now()]);

        return response()->json([
            'data' => MessageResource::collection($messages->items()),
            'meta' => [
                'current_page' => $messages->currentPage(),
                'last_page'    => $messages->lastPage(),
                'total'        => $messages->total(),
            ],
        ]);
    }

    /**
     * Send a message.
     * POST /api/messages
     * Body: { receiver_id, content }
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'receiver_id' => ['required', 'integer', 'exists:users,id'],
            'content'     => ['required', 'string', 'max:2000'],
        ]);

        // Prevent messaging yourself
        if ($request->receiver_id === $request->user()->id) {
            return response()->json(['message' => 'You cannot message yourself.'], 422);
        }

        $message = Message::create([
            'sender_id'   => $request->user()->id,
            'receiver_id' => $request->receiver_id,
            'content'     => $request->content,
        ]);

        $message->load(['sender', 'receiver']);

        return response()->json([
            'data'    => new MessageResource($message),
            'message' => 'Message sent.',
        ], 201);
    }

    /**
     * List all conversations (users you've messaged).
     * GET /api/messages
     */
    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        // Get the latest message from each conversation
        $conversations = Message::where('sender_id', $userId)
            ->orWhere('receiver_id', $userId)
            ->latest()
            ->get()
            ->groupBy(fn($msg) => $msg->sender_id === $userId ? $msg->receiver_id : $msg->sender_id)
            ->map(fn($messages) => $messages->first()) // Latest message per conversation
            ->values();

        return response()->json([
            'data' => MessageResource::collection($conversations),
        ]);
    }

    /**
     * Count unread messages for the authenticated user.
     * GET /api/messages/unread-count
     */
    public function unreadCount(Request $request): JsonResponse
    {
        $count = Message::where('receiver_id', $request->user()->id)
                        ->whereNull('read_at')
                        ->count();

        return response()->json(['count' => $count]);
    }
}
