"use client";

import * as React from "react";

const STORAGE_KEY = "festive:wish";

/**
 * The visitor's wish, backed by localStorage.
 *
 * This goes through `useSyncExternalStore` rather than "read in an effect, then
 * setState" so the server snapshot (always null) hydrates cleanly and no
 * cascading render is triggered on mount.
 */
const listeners = new Set<() => void>();

let cached: string | null = null;
let cacheValid = false;

function read(): string | null {
  if (!cacheValid) {
    try {
      cached = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      cached = null; // private mode or storage disabled
    }
    cacheValid = true;
  }
  return cached;
}

function serverSnapshot(): null {
  return null;
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  // Keeps two tabs of the same card in agreement.
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) {
      cacheValid = false;
      onChange();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

export function useStoredWish() {
  const wish = React.useSyncExternalStore(subscribe, read, serverSnapshot);

  const setWish = React.useCallback((value: string | null) => {
    try {
      if (value === null) window.localStorage.removeItem(STORAGE_KEY);
      else window.localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // Not fatal: the value still lives in the in-memory cache below.
    }
    cached = value;
    cacheValid = true;
    listeners.forEach((listener) => listener());
  }, []);

  return [wish, setWish] as const;
}
