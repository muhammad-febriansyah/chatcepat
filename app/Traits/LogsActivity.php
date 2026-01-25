<?php

namespace App\Traits;

use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;

trait LogsActivity
{
    /**
     * Log an activity.
     *
     * @param string $action The action performed (create, update, delete, etc.)
     * @param string|null $resourceType The type of resource (Contact, Template, etc.)
     * @param int|null $resourceId The ID of the resource
     * @param string|null $resourceName The name/title of the resource
     * @param array|null $oldValues Previous values (for update/delete)
     * @param array|null $newValues New values (for create/update)
     * @param string|null $description Custom description
     * @param array|null $metadata Additional metadata
     * @param bool $isSuccessful Whether the action was successful
     * @param string|null $errorMessage Error message if failed
     * @return ActivityLog|null
     */
    protected function logActivity(
        string $action,
        ?string $resourceType = null,
        ?int $resourceId = null,
        ?string $resourceName = null,
        ?array $oldValues = null,
        ?array $newValues = null,
        ?string $description = null,
        ?array $metadata = null,
        bool $isSuccessful = true,
        ?string $errorMessage = null
    ): ?ActivityLog {
        try {
            $user = Auth::user();

            if (!$user) {
                return null;
            }

            $request = request();
            $userAgent = $request->userAgent() ?? '';

            return ActivityLog::create([
                'user_id' => $user->id,
                'action' => $action,
                'resource_type' => $resourceType,
                'resource_id' => $resourceId,
                'resource_name' => $resourceName,
                'old_values' => $oldValues,
                'new_values' => $newValues,
                'metadata' => array_merge([
                    'description' => $description,
                ], $metadata ?? []),
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
            return null;
        }
    }

    /**
     * Get device type from user agent.
     *
     * @param string $userAgent
     * @return string
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
     *
     * @param string $userAgent
     * @return string
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
     *
     * @param string $userAgent
     * @return string
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
