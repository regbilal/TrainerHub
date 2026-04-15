import fs from 'node:fs';
import net from 'node:net';
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

/** True if something accepts TCP on this URL’s host:port (fast; avoids guessing 5000 vs IIS port). */
function canConnect(baseUrl: string, timeoutMs: number): Promise<boolean> {
  return new Promise((resolve) => {
    let port: number;
    let hostname: string;
    try {
      const u = new URL(baseUrl);
      hostname = u.hostname;
      port = u.port ? Number(u.port) : u.protocol === 'https:' ? 443 : 80;
    } catch {
      resolve(false);
      return;
    }
    const socket = net.connect({ port, host: hostname }, () => {
      socket.destroy();
      resolve(true);
    });
    socket.setTimeout(timeoutMs, () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => resolve(false));
  });
}

/** Prefer Kestrel (`http` profile) when both run; otherwise use whichever answers (e.g. IIS Express). */
async function pickReachableApiBase(launchSettingsPath: string): Promise<string | null> {
  const httpUrl = resolveFromLaunchSettings(launchSettingsPath, 'http');
  const iisUrl = resolveFromLaunchSettings(launchSettingsPath, 'iis');
  const candidates = [httpUrl, iisUrl].filter(
    (x, i, arr): x is string => x != null && arr.indexOf(x) === i,
  );

  if (candidates.length === 0) return null;
  if (candidates.length === 1) return candidates[0];

  for (const url of candidates) {
    if (await canConnect(url, 400)) return url;
  }
  return candidates[0];
}

// Dev proxy: reads ../TrainerHub.API/Properties/launchSettings.json.
// Overrides: VITE_API_URL, or VITE_API_LAUNCH_PROFILE=http|iis
// If neither is set, picks the first reachable port (http profile first, then IIS Express).
export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const launchSettingsJson = path.resolve(
    __dirname,
    '../TrainerHub.API/Properties/launchSettings.json',
  );

  let apiTarget = env.VITE_API_URL;
  if (!apiTarget) {
    const explicitProfile = env.VITE_API_LAUNCH_PROFILE?.trim();
    if (explicitProfile) {
      const profile = normalizeLaunchProfile(explicitProfile);
      apiTarget =
        resolveFromLaunchSettings(launchSettingsJson, profile) ??
        'http://localhost:5000';
    } else {
      apiTarget =
        (await pickReachableApiBase(launchSettingsJson)) ?? 'http://localhost:5000';
    }
  }

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
