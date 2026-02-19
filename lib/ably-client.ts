"use client";

import Ably from 'ably';

export const ably = new Ably.Realtime({
  authUrl: '/api/ably-token',
  autoConnect: true
});

// Optimization: Pause Ably connection when the tab is hidden to save battery and resources
if (typeof window !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      console.log('Tab hidden: closing Ably connection');
      ably.connection.close();
    } else {
      console.log('Tab visible: reconnecting Ably');
      ably.connection.connect();
    }
  });
}
