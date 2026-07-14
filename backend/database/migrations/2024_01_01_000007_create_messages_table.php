<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration: Messages Table
 *
 * Simple direct messaging between users (coach ↔ student).
 * This is NOT a group chat — only 1-to-1 messages.
 *
 * For a real production app, you'd add:
 * - Real-time via Laravel Echo + Pusher/Soketi
 * - Message threads/conversations as a separate table
 * - File attachments
 *
 * For portfolio purposes, this shows understanding of
 * the self-referential pattern (both columns point to users).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('messages', function (Blueprint $table) {
            $table->id();

            // Both sender and receiver reference the users table
            $table->foreignId('sender_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('receiver_id')->constrained('users')->onDelete('cascade');

            $table->text('content');

            // NULL means unread, timestamp means when it was read.
            // This is a common pattern called "nullable timestamp for boolean state"
            // It records both WHETHER it was read AND WHEN — more info than a boolean.
            $table->timestamp('read_at')->nullable();

            // Index for "get my conversation with user X" queries
            $table->index(['sender_id', 'receiver_id']);
            $table->index(['receiver_id', 'read_at']); // Fast unread count queries

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};
