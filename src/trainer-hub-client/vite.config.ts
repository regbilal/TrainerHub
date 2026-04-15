import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** First URL from `applicationUrl` (e.g. "http://localhost:5000;https://localhost:5001"). */
function firstHttpUrl(applicationUrl: string | undefined): string | null {
  if (!applicationUrl) return null;
  const parts = applicationUrl
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);
  for (const part of parts) {
    if (part.startsWith('http://') || part.startsWith('https://')) {
      return part;
    }
  }
  return parts[0] ?? null;
}

type LaunchProfile = 'http' | 'iis';

function normalizeLaunchProfile(raw: string | undefined): LaunchProfile {
  const v = (raw ?? 'http').toLowerCase().replace(/[\s_-]+/g, '');
  if (v === 'iisexpress' || v === 'iis') return 'iis';
  return 'http';
}

function resolveFromLaunchSettings(
  launchSettingsPath: string,
  profile: LaunchProfile,
): string | null {
  if (!fs.existsSync(launchSettingsPath)) return null;
  try {
    const raw = fs.readFileSync(launchSettingsPath, 'utf8');
    const json = JSON.parse(raw) as {
      iisSettings?: { iisExpress?: { applicationUrl?: string } };
      profiles?: { http?: { applicationUrl?: string } };
    };
    if (profile === 'iis') {
      return firstHttpUrl(json.iisSettings?.iisExpress?.applicationUrl);
    }
    return firstHttpUrl(json.profiles?.http?.applicationUrl);
  } catch {
    return null;
  }
}

// API base URL for the dev proxy: same source as Visual Studio / dotnet (launchSettings.json).
// Optional override: VITE_API_URL. Profile switch: VITE_API_LAUNCH_PROFILE=http | iis
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const launchSettingsJson = path.resolve(
    __dirname,
    '../TrainerHub.API/Properties/launchSettings.json',
  );
  const profile = normalizeLaunchProfile(env.VITE_API_LAUNCH_PROFILE);

  const apiTarget =
    env.VITE_API_URL ||
    resolveFromLaunchSettings(launchSettingsJson, profile) ||
    'http://localhost:5000';

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
