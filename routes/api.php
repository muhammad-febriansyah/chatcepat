<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\WhatsAppGatewayController;

// Get authenticated user
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// WhatsApp Gateway API - For Express.js to call
Route::middleware('auth:sanctum')->prefix('whatsapp-gateway')->name('api.whatsapp-gateway.')->group(function () {
    // Verify session ownership
    Route::post('/verify-session', [WhatsAppGatewayController::class, 'verifySession'])->name('verify-session');

    // Update session status from gateway
    Route::post('/sessions/{sessionId}/status', [WhatsAppGatewayController::class, 'updateSessionStatus'])->name('update-status');

    // Update QR code
    Route::post('/sessions/{sessionId}/qr', [WhatsAppGatewayController::class, 'updateQRCode'])->name('update-qr');

    // Store incoming message
    Route::post('/sessions/{sessionId}/messages', [WhatsAppGatewayController::class, 'storeMessage'])->name('store-message');

    // Sync contacts
    Route::post('/sessions/{sessionId}/contacts/sync', [WhatsAppGatewayController::class, 'syncContacts'])->name('sync-contacts');

    // Get user by ID (for Express to validate)
    Route::get('/users/{id}', [WhatsAppGatewayController::class, 'getUser'])->name('get-user');

    // Get session by ID
    Route::get('/sessions/{sessionId}', [WhatsAppGatewayController::class, 'getSession'])->name('get-session');
});
