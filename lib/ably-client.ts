"use client";

import Ably from 'ably';

export const ably = new Ably.Realtime({
  authCallback: async (tokenParams, callback) => {
    try {
      const response = await fetch('/api/ably-token');
      if (!response.ok) {
        callback(new Error(`Token request failed: ${response.status}`), null);
        return;
      }
      const tokenRequest = await response.json();
      callback(null, tokenRequest);
    } catch (error) {
      callback(error as Error, null);
    }
  },
});
