<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;

class CsrfTokenController extends Controller
{
    /**
     * Refresh CSRF token
     * 
     * This endpoint is used by frontend to refresh CSRF token
     * to prevent 419 errors on long-running admin pages.
     */
    public function refresh(): JsonResponse
    {
        // Regenerate CSRF token
        request()->session()->regenerateToken();

        return response()->json([
            'success' => true,
            'csrf_token' => csrf_token(),
            'message' => 'CSRF token refreshed successfully',
        ]);
    }
}
