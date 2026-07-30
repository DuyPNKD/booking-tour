import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
        proxy: {
            // Navbar menu route
            '/navbar-menu': {
                target: 'http://localhost:5029',
                changeOrigin: true,
                secure: false,
            },
            // All API routes
            '/api': {
                target: 'http://localhost:5029',
                changeOrigin: true,
                secure: false,
            }
        }
    }
});
