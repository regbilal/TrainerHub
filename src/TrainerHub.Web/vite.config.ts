import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Dev: run `npm run dev` (this server). Browse the app via Kestrel at http://localhost:5000 — ASP.NET proxies
// non-API requests here so /api stays same-origin. Do not open http://localhost:5173 for normal use.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    strictPort: true,
  },
});
