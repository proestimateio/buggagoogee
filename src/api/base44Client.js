import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';
import { localStore } from '@/lib/saveStore';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

// If no Base44 app id is configured, use the localStorage-backed mock so the
// game is fully playable in any environment (including a fresh local clone).
const useLocal = !appId;

export const base44 = useLocal
  ? localStore
  : createClient({
      appId,
      token,
      functionsVersion,
      serverUrl: '',
      requiresAuth: false,
      appBaseUrl,
    });

export const isLocalMode = useLocal;
