"use client";

import Ably from 'ably';

let ablyInstance: Ably.Realtime | null = null;

export function getAbly(): Ably.Realtime {
  if (!ablyInstance) {
    ablyInstance = new Ably.Realtime({
      authCallback: async (tokenParams, callback) => {
        try {
          const response = await fetch('/api/ably-token');
          if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            callback(new Error(data.error || `Token request failed: ${response.status}`), null);
            return;
          }
          const tokenRequest = await response.json();
          callback(null, tokenRequest);
        } catch (error) {
          callback(error as Error, null);
        }
      },
      autoConnect: false,
    });
  }
  return ablyInstance;
}

// For backward compatibility - lazy initialized
export const ably = typeof window !== 'undefined'
  ? new Proxy({} as Ably.Realtime, {
      get(_, prop) {
        return (getAbly() as any)[prop];
      },
    })
  : (null as unknown as Ably.Realtime);
