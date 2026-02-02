import axios from 'axios';
import { router } from '@inertiajs/react';

/**
 * Axios Configuration (for AJAX requests in chat, reports, etc.)
 * Note: Inertia handles most navigation & forms automatically
 */
const getCsrfToken = () => {
    return document.head.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '';
};

// Basic axios setup for AJAX features (chat, reports, API calls)
axios.defaults.withCredentials = true;
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
axios.defaults.headers.common['X-CSRF-TOKEN'] = getCsrfToken();

// Auto-reload on 419 CSRF errors from axios requests
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 419) {
            console.warn('[CSRF] Token mismatch detected. Refreshing page...');
            window.location.reload();
        }
        return Promise.reject(error);
    }
);

/**
 * Inertia Configuration (handles most app navigation & forms)
 * Inertia automatically handles CSRF for router.visit() and <Form>
 */

// Smart retry mechanism for 419 errors
let retryCount = 0;
const MAX_RETRIES = 2;

router.on('error', (event) => {
    if (event.detail.page?.props?.status === 419) {
        console.warn(`[CSRF] Token mismatch detected (attempt ${retryCount + 1}/${MAX_RETRIES})`);

        if (retryCount < MAX_RETRIES) {
            retryCount++;

            // Refresh CSRF token
            const metaTag = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]');
            if (metaTag) {
                // Fetch fresh token via micro-request
                fetch('/api/csrf/refresh', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': metaTag.content,
                    },
                    credentials: 'same-origin',
                })
                .then(res => res.json())
                .then(data => {
                    if (data.csrf_token) {
                        // Update token in meta tag
                        metaTag.content = data.csrf_token;
                        axios.defaults.headers.common['X-CSRF-TOKEN'] = data.csrf_token;

                        console.log('[CSRF] Token refreshed, retrying request...');

                        // Retry the original request after a short delay
                        setTimeout(() => {
                            window.location.reload();
                        }, 500);
                    }
                })
                .catch(() => {
                    console.error('[CSRF] Failed to refresh token, reloading page...');
                    window.location.reload();
                });
            } else {
                window.location.reload();
            }
        } else {
            console.error('[CSRF] Max retries reached, reloading page...');
            retryCount = 0;
            window.location.reload();
        }
    } else {
        // Reset retry count on other errors
        retryCount = 0;
    }
});

// Reset retry count on successful navigation
router.on('success', () => {
    retryCount = 0;
});

export default axios;
