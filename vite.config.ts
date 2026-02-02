import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';

const isProduction = process.env.NODE_ENV === 'production';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react({
            babel: {
                plugins: ['babel-plugin-react-compiler'],
            },
        }),
        tailwindcss(),
        // Skip wayfinder in production to avoid build errors
        !isProduction && wayfinder({
            formVariants: true,
        }),
    ].filter(Boolean),
    esbuild: {
        jsx: 'automatic',
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: (id) => {
                    // Vendor chunk strategy - split large libraries
                    if (id.includes('node_modules')) {
                        // Icon libraries (separate FIRST - largest culprits)
                        if (id.includes('lucide-react')) {
                            return 'vendor-icons';
                        }

                        // Chart libraries (second largest)
                        if (id.includes('apexcharts')) {
                            return 'vendor-charts';
                        }

                        // Rich text editor (TipTap)
                        if (id.includes('@tiptap')) {
                            return 'vendor-editor';
                        }

                        // Map libraries (Leaflet)
                        if (id.includes('leaflet')) {
                            return 'vendor-maps';
                        }

                        // Animation libraries
                        if (id.includes('framer-motion')) {
                            return 'vendor-animation';
                        }

                        // UI component libraries (Radix)
                        if (id.includes('@radix-ui')) {
                            return 'vendor-ui';
                        }

                        // Date/time libraries
                        if (id.includes('date-fns')) {
                            return 'vendor-date';
                        }

                        // All other React ecosystem (includes React, ReactDOM, Inertia, react-*, etc)
                        // This catches everything else to avoid circular dependencies
                        return 'vendor-react';
                    }
                },
            },
        },
        chunkSizeWarningLimit: 1000, // Increase limit since vendor-react will be larger
    },
});
