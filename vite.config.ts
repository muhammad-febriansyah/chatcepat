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
                        // Icon libraries (separate FIRST before React check)
                        if (id.includes('lucide-react')) {
                            return 'vendor-icons-lucide';
                        }
                        if (id.includes('@tabler/icons-react')) {
                            return 'vendor-icons-tabler';
                        }

                        // React core (without react-* packages)
                        if (id.includes('/react/') || id.includes('/react-dom/')) {
                            return 'vendor-react-core';
                        }

                        // Inertia
                        if (id.includes('@inertiajs')) {
                            return 'vendor-inertia';
                        }

                        // Chart libraries
                        if (id.includes('apexcharts') || id.includes('react-apexcharts')) {
                            return 'vendor-charts';
                        }

                        // Rich text editor (TipTap)
                        if (id.includes('@tiptap') || id.includes('prosemirror')) {
                            return 'vendor-editor';
                        }

                        // Map libraries (Leaflet)
                        if (id.includes('leaflet') || id.includes('react-leaflet')) {
                            return 'vendor-maps';
                        }

                        // UI component libraries (Radix)
                        if (id.includes('@radix-ui')) {
                            return 'vendor-ui';
                        }

                        // Date/time libraries
                        if (id.includes('date-fns') || id.includes('react-datepicker')) {
                            return 'vendor-date';
                        }

                        // Animation libraries
                        if (id.includes('framer-motion') || id.includes('motion')) {
                            return 'vendor-animation';
                        }

                        // Table libraries
                        if (id.includes('@tanstack/react-table')) {
                            return 'vendor-table';
                        }

                        // Socket.io
                        if (id.includes('socket.io')) {
                            return 'vendor-socket';
                        }

                        // Other React ecosystem packages
                        if (id.includes('react-')) {
                            return 'vendor-react-ecosystem';
                        }

                        // Other vendors
                        return 'vendor-misc';
                    }
                },
            },
        },
        chunkSizeWarningLimit: 600, // Slightly increase limit for vendor chunks
    },
});
