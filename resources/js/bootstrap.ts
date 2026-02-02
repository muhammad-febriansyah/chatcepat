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

// Auto-reload on 419 errors from Inertia requests
router.on('error', (event) => {
    if (event.detail.page?.props?.status === 419) {
        console.warn('[CSRF] Token mismatch detected. Refreshing page...');
        window.location.reload();
    }
});

export default axios;
