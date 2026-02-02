import axios from 'axios';
import { router } from '@inertiajs/react';

/**
 * Axios Configuration (for AJAX requests)
 */
axios.defaults.withCredentials = true;
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

/**
 * Inertia will handle CSRF automatically using the XSRF-TOKEN cookie.
 * No need for manual header assignment or complex refresh loops in standard setup.
 */

export default axios;
