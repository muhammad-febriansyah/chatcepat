import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';

/**
 * Axios Configuration (for AJAX requests in chat, reports, etc.)
 * Note: Inertia handles most navigation & forms automatically
 */
const getCsrfToken = () => {
    return document.head.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '';
};

// Fetch new CSRF token from server
async function refreshCsrfToken(): Promise<string | null> {
    try {
        const response = await fetch('/api/csrf/refresh', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Accept': 'application/json',
            },
        });

        if (response.ok) {
            const data = await response.json();
            if (data.csrf_token) {
                // Update meta tag
                const metaTag = document.querySelector('meta[name="csrf-token"]');
                if (metaTag) {
                    metaTag.setAttribute('content', data.csrf_token);
                }
                // Update axios default header
                axios.defaults.headers.common['X-CSRF-TOKEN'] = data.csrf_token;
                console.log('[CSRF] Token refreshed successfully');
                return data.csrf_token;
            }
        }
    } catch (error) {
        console.error('[CSRF] Failed to refresh token:', error);
    }
    return null;
}

// Basic axios setup for AJAX features (chat, reports, API calls)
axios.defaults.withCredentials = true;
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
axios.defaults.headers.common['X-CSRF-TOKEN'] = getCsrfToken();

// Track retry attempts to prevent infinite loops
const retriedRequests = new WeakMap<InternalAxiosRequestConfig, boolean>();

// Smart 419 handler: refresh token and retry automatically
axios.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config;

        // Handle 419 CSRF errors with automatic retry
        if (error.response?.status === 419 && originalRequest && !retriedRequests.get(originalRequest)) {
            console.log('[CSRF] Token expired, attempting silent refresh and retry...');

            // Mark this request as retried to prevent loops
            retriedRequests.set(originalRequest, true);

            // Try to get new CSRF token
            const newToken = await refreshCsrfToken();

            if (newToken) {
                // Update request with new token
                originalRequest.headers['X-CSRF-TOKEN'] = newToken;

                // Retry the original request
                try {
                    console.log('[CSRF] Retrying request with new token...');
                    return await axios(originalRequest);
                } catch (retryError) {
                    console.error('[CSRF] Retry failed:', retryError);
                    toast.error('Sesi Anda telah berakhir. Silakan refresh halaman dan coba lagi.');
                }
            } else {
                toast.error('Gagal memperbarui sesi. Silakan refresh halaman.');
            }
        }

        return Promise.reject(error);
    }
);

/**
 * Inertia Configuration (handles most app navigation & forms)
 * Inertia automatically handles CSRF for router.visit() and <Form>
 */

// Handle 419 errors from Inertia with helpful message (no reload)
router.on('error', async (event) => {
    const status = event.detail.page?.props?.status;

    if (status === 419) {
        console.log('[CSRF] Inertia detected 419 error, refreshing token...');

        // Refresh token silently
        const newToken = await refreshCsrfToken();

        if (newToken) {
            // Show friendly message to retry
            toast.error('Sesi telah diperbarui. Silakan klik tombol "Daftar Sekarang" sekali lagi.', {
                duration: 5000,
            });
        } else {
            toast.error('Gagal memperbarui sesi. Silakan refresh halaman dan coba lagi.', {
                action: {
                    label: 'Refresh',
                    onClick: () => window.location.reload(),
                },
                duration: 10000,
            });
        }
    }
});

export default axios;
