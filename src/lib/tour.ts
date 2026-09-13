"use client";

const KEY = "gofit.tourSeen";

/** Whether the intro tour has already been shown on this device. */
export function hasSeenTour(): boolean {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(KEY) === "1";
}

/** Mark the intro tour as seen so it won't show again. */
export function markTourSeen(): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, "1");
}
