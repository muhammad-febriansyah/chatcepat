/**
 * CSRF Token Auto-Refresh Utility
 * 
 * Automatically refreshes CSRF token every 60 minutes to prevent 419 errors
 * on long-running admin pages.
 */
import axios from 'axios';

let refreshInterval: NodeJS.Timeout | null = null;
let isRefreshing = false;
let lastRefreshTime = 0;
let eventListenersAdded = false;

// Minimum interval between refreshes (5 seconds) to prevent spam
const MIN_REFRESH_INTERVAL = 5000;

/**
 * Fetch fresh CSRF token from server
 */
async function fetchCsrfToken(): Promise<string | null> {
    // Prevent concurrent refresh requests
    if (isRefreshing) {
        console.log('[CSRF] Refresh already in progress, skipping...');
        return null;
    }

    // Prevent too frequent refreshes
    const now = Date.now();
    if (now - lastRefreshTime < MIN_REFRESH_INTERVAL) {
        console.log('[CSRF] Too soon since last refresh, skipping...');
        return null;
    }

    isRefreshing = true;
    lastRefreshTime = now;

    try {
        const response = await axios.post('/api/csrf/refresh', {}, {
            headers: {
                'Accept': 'application/json',
            },
        });

        const data = response.data;

        // Update CSRF token in meta tag
        const metaTag = document.querySelector('meta[name="csrf-token"]');
        if (metaTag && data.csrf_token) {
            metaTag.setAttribute('content', data.csrf_token);
            console.log('[CSRF] Token refreshed successfully');
            return data.csrf_token;
        }
    } catch (error) {
        console.error('[CSRF] Failed to refresh token:', error);
    } finally {
        isRefreshing = false;
    }
    return null;
}

/**
 * Handle visibility change events
 */
function handleVisibilityChange() {
    if (!document.hidden) {
        console.log('[CSRF] Page visible - refreshing token');
        fetchCsrfToken();
    }
}

/**
 * Handle window focus events
 */
function handleWindowFocus() {
    console.log('[CSRF] Window focused - refreshing token');
    fetchCsrfToken();
}

/**
 * Start auto-refresh CSRF token
 * @param intervalMinutes - Refresh interval in minutes (default: 10)
 */
export function startCsrfAutoRefresh(intervalMinutes: number = 10): void {
    // Clear existing interval if any
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }

    // Refresh immediately on start
    fetchCsrfToken();

    // Set up periodic refresh (more frequent = less 419 errors)
    refreshInterval = setInterval(() => {
        fetchCsrfToken();
    }, intervalMinutes * 60 * 1000); // Convert minutes to milliseconds

    console.log(`[CSRF] Auto-refresh started (every ${intervalMinutes} minutes)`);

    // Add event listeners only once (prevent duplicate listeners)
    if (!eventListenersAdded) {
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleWindowFocus);
        eventListenersAdded = true;
        console.log('[CSRF] Event listeners added');
    }
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

    // Remove event listeners
    if (eventListenersAdded) {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('focus', handleWindowFocus);
        eventListenersAdded = false;
        console.log('[CSRF] Event listeners removed');
    }
}

/**
 * Manually refresh CSRF token
 */
export async function refreshCsrfToken(): Promise<string | null> {
    return await fetchCsrfToken();
}
