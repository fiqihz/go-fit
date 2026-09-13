"use client";

import { useEffect } from "react";

/** Registers the service worker for installable PWA + offline app shell. */
export function RegisterSW() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Registration failures are non-fatal; the app still works online.
    });
  }, []);
  return null;
}
