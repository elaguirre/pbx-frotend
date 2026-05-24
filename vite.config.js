import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    cacheDir: '.vite',
    plugins: [react()],
    server: {
        port: 8010,
        host: true,
    },
    resolve: {
        alias: {
            '@features': '/src/features',
            '@pages': '/src/pages',
            '@resources': '/src/resources',
        },
    },
});
