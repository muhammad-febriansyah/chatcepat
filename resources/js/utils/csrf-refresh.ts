/**
 * CSRF Token Auto-Refresh Utility
 * 
 * Automatically refreshes CSRF token every 60 minutes to prevent 419 errors
 * on long-running admin pages.
 */

let refreshInterval: NodeJS.Timeout | null = null;

/**
 * Fetch fresh CSRF token from server
 */
async function fetchCsrfToken(): Promise<string | null> {
    try {
        const response = await fetch('/api/csrf/refresh', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Accept': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
        });

        if (response.ok) {
            const data = await response.json();

            // Update CSRF token in meta tag
            const metaTag = document.querySelector('meta[name="csrf-token"]');
            if (metaTag && data.csrf_token) {
                metaTag.setAttribute('content', data.csrf_token);
                console.log('[CSRF] Token refreshed successfully');
                return data.csrf_token;
            }
        }
    } catch (error) {
        console.error('[CSRF] Failed to refresh token:', error);
    }
    return null;
}

/**
 * Start auto-refresh CSRF token
 * @param intervalMinutes - Refresh interval in minutes (default: 60)
 */
export function startCsrfAutoRefresh(intervalMinutes: number = 60): void {
    // Clear existing interval if any
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }

    // Refresh immediately on start
    fetchCsrfToken();

    // Set up periodic refresh
    refreshInterval = setInterval(() => {
        fetchCsrfToken();
    }, intervalMinutes * 60 * 1000); // Convert minutes to milliseconds

    console.log(`[CSRF] Auto-refresh started (every ${intervalMinutes} minutes)`);
}

/**
 * Stop auto-refresh CSRF token
 */
export function stopCsrfAutoRefresh(): void {
    if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
        console.log('[CSRF] Auto-refresh stopped');
    }
}

/**
 * Manually refresh CSRF token
 */
export async function refreshCsrfToken(): Promise<string | null> {
    return await fetchCsrfToken();
}
