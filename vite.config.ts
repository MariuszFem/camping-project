import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import plugin from '@vitejs/plugin-react';

const target = 'http://localhost:5050';

export default defineConfig({
    plugins: [plugin()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    server: {
        proxy: {
          '^/Klienci': { target: 'http://localhost:5050', secure: false },
            '^/Strefy': { target, secure: false, changeOrigin: true },
            '^/Miejsca': { target, secure: false, changeOrigin: true },
            '^/Pracownicy': { target, secure: false, changeOrigin: true },
            '^/Rezerwacje': { target, secure: false, changeOrigin: true },
            '^/Auth': { target: 'http://localhost:5050', secure: false },
            
        },
        port: 63796,
        strictPort: true
    }
})