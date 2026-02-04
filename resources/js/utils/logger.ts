/**
 * Logger utility for development-only logging
 * In production, all logs are suppressed for security
 */

const isDevelopment = import.meta.env.DEV;

export const logger = {
    /**
     * Log general information (only in development)
     */
    log: (...args: any[]) => {
        if (isDevelopment) {
            console.log(...args);
        }
    },

    /**
     * Log errors (only in development)
     */
    error: (...args: any[]) => {
        if (isDevelopment) {
            console.error(...args);
        }
    },

    /**
     * Log warnings (only in development)
     */
    warn: (...args: any[]) => {
        if (isDevelopment) {
            console.warn(...args);
        }
    },

    /**
     * Log debug information (only in development)
     */
    debug: (...args: any[]) => {
        if (isDevelopment) {
            console.debug(...args);
        }
    },

    /**
     * Log info (only in development)
     */
    info: (...args: any[]) => {
        if (isDevelopment) {
            console.info(...args);
        }
    },
};
