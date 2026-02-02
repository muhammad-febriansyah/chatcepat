import axios from 'axios';
import { router } from '@inertiajs/react';

// Configure axios to send CSRF token with every request
axios.defaults.withCredentials = true
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'

// Get CSRF token from meta tag and set it in axios headers
const token = document.head.querySelector('meta[name="csrf-token"]');
if (token) {
    axios.defaults.headers.common['X-CSRF-TOKEN'] = token.getAttribute('content');
} else {
    console.error('CSRF token not found: https://laravel.com/docs/csrf#csrf-x-csrf-token');
}

// Configure Inertia to send CSRF token
router.on('before', (event) => {
    const csrfToken = document.head.querySelector('meta[name="csrf-token"]');
    if (csrfToken) {
        event.detail.visit.headers = {
            ...event.detail.visit.headers,
            'X-CSRF-TOKEN': csrfToken.getAttribute('content') || '',
        };
    }
});

// Global error handler for 419 CSRF token errors
router.on('error', (event) => {
    const response = event.detail.page?.props?.errors;

    // Check if it's a 419 error (CSRF token mismatch)
    if (event.detail.page?.component === 'Error' && event.detail.page?.props?.status === 419) {
        console.warn('[CSRF] 419 error detected - Token mismatch. Reloading page to refresh token...');

        // Reload the page to get a fresh CSRF token
        window.location.reload();
    }
});

// Axios interceptor for 419 errors
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 419) {
            console.warn('[CSRF] 419 error detected in axios request - Token mismatch. Reloading page...');
            window.location.reload();
        }
        return Promise.reject(error);
    }
);

export default axios;
