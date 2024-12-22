import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    base: "https://cdn.chub.page/",
    plugins: [react()],
    resolve: {
        extensions: ['.js', '.jsx', '.json']
    },
    esbuild: {
        loader: "jsx",
        include: /src\/.*\.jsx?$/,
        exclude: []
    },
    optimizeDeps: {
        esbuildOptions: {
            loader: {
                '.js': 'jsx'
            }
        }
    },
    build: {
        outDir: 'build',
        sourcemap: true,
        assetsDir: 'assets',
        chunkSizeWarningLimit: 2500,
        rollupOptions: {
            output: {
                assetFileNames: 'assets/[hash:20][extname]',
                chunkFileNames: 'assets/[hash:20].js',
                entryFileNames: 'assets/[hash:20].js',
                hashCharacters: 'hex',
            }
        }
    },
});