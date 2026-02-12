<?php

namespace App\Listeners;

use App\Models\ActivityLog;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Auth\Events\Failed;

class LogAuthenticationActivity
{
    /**
     * Handle user login events.
     */
    public function handleLogin(Login $event): void
    {
        try {
            $event->user->update(['last_login_at' => now()]);
        } catch (\Exception $e) {
            report($e);
        }
        $this->logAuthActivity($event->user, 'login', 'Autentikasi', true);
    }

    /**
     * Handle user logout events.
     */
    public function handleLogout(Logout $event): void
    {
        if ($event->user) {
            $this->logAuthActivity($event->user, 'logout', 'Autentikasi', true);
        }
    }

    /**
     * Handle failed login attempts.
     */
    public function handleFailed(Failed $event): void
    {
        if ($event->user) {
            $this->logAuthActivity($event->user, 'login_failed', 'Autentikasi', false, 'Login gagal');
        }
    }

    /**
     * Log authentication activity.
     */
    private function logAuthActivity($user, string $action, string $resourceType, bool $isSuccessful, ?string $errorMessage = null): void
    {
        try {
            $request = request();
            $userAgent = $request->userAgent() ?? '';

            ActivityLog::create([
                'user_id' => $user->id,
                'action' => $action,
                'resource_type' => $resourceType,
                'resource_id' => null,
                'resource_name' => null,
                'old_values' => null,
                'new_values' => null,
                'metadata' => [
                    'email' => $user->email,
                    'name' => $user->name,
                ],
                'ip_address' => $request->ip(),
                'user_agent' => $userAgent,
                'device_type' => $this->getDeviceType($userAgent),
                'browser' => $this->getBrowser($userAgent),
                'platform' => $this->getPlatform($userAgent),
                'is_successful' => $isSuccessful,
                'error_message' => $errorMessage,
            ]);
        } catch (\Exception $e) {
            // Fail silently - logging shouldn't break the application
            report($e);
        }
    }

    /**
     * Get device type from user agent.
     */
    private function getDeviceType(string $userAgent): string
    {
        $userAgent = strtolower($userAgent);

        if (preg_match('/(android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini)/i', $userAgent)) {
            if (preg_match('/(ipad|tablet|playbook|kindle)/i', $userAgent)) {
                return 'tablet';
            }
            return 'mobile';
        }

        if (preg_match('/(bot|crawler|spider|scraper)/i', $userAgent)) {
            return 'bot';
        }

        return 'desktop';
    }

    /**
     * Get browser from user agent.
     */
    private function getBrowser(string $userAgent): string
    {
        if (preg_match('/Edge/i', $userAgent)) {
            return 'Edge';
        } elseif (preg_match('/Chrome/i', $userAgent)) {
            return 'Chrome';
        } elseif (preg_match('/Safari/i', $userAgent)) {
            return 'Safari';
        } elseif (preg_match('/Firefox/i', $userAgent)) {
            return 'Firefox';
        } elseif (preg_match('/MSIE|Trident/i', $userAgent)) {
            return 'Internet Explorer';
        } elseif (preg_match('/Opera|OPR/i', $userAgent)) {
            return 'Opera';
        }

        return 'Unknown';
    }

    /**
     * Get platform from user agent.
     */
    private function getPlatform(string $userAgent): string
    {
        if (preg_match('/Windows/i', $userAgent)) {
            return 'Windows';
        } elseif (preg_match('/Mac OS X/i', $userAgent)) {
            return 'macOS';
        } elseif (preg_match('/Linux/i', $userAgent)) {
            return 'Linux';
        } elseif (preg_match('/Android/i', $userAgent)) {
            return 'Android';
        } elseif (preg_match('/iOS|iPhone|iPad/i', $userAgent)) {
            return 'iOS';
        }

        return 'Unknown';
    }
}
