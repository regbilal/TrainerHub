import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// API base URL for the dev proxy (must match where the ASP.NET Core app listens).
// Default: http://localhost:5000 (dotnet run / "http" launch profile)
// If you use IIS Express / Visual Studio, set in .env.development:
//   VITE_API_URL=http://localhost:41038
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiTarget = env.VITE_API_URL || 'http://localhost:5000';

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
