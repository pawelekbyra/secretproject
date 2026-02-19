"use client";

import { useEffect } from "react";

export default function ServiceWorkerManager() {
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then(() => {
          console.log('Service Worker registered successfully.');
        })
        .catch(err => {
          console.error('Service Worker registration failed:', err);
        });
    }
  }, []);

  return null;
}
