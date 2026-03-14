import { loadEnv, defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    return {
        base: env.ASSETS_BASE,
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
        server: {
            // https://github.com/vitejs/vite/discussions/13280
            proxy: {
                '/__vite_dev_proxy__': {
                    changeOrigin: true,
                    configure(_, options) {
                        options.rewrite = path => {
                            const proxyUrl = new URL(path, 'file:'),
                                url = new URL(proxyUrl.searchParams.get('url'));

                            // Since JS is single threaded, so it won't cause problem
                            options.target = url.origin;
                            return url.pathname + url.search;
                        };
                    },
                },
            }
        },
    };
});