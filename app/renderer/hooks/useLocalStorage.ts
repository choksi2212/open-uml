import { useState, useEffect } from 'react';

/**
 * Persisted state. Stores JSON in localStorage under `key`, falling back
 * to `initial` if storage is unavailable or the stored value can't be
 * parsed. Returns a setter that's a normal React state setter - the
 * localStorage write is side-effected.
 */
export function useLocalStorage<T>(key: string, initial: T): [T, (v: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return initial;
      return JSON.parse(raw) as T;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* quota exceeded - silently ignore */
    }
  }, [key, value]);

  return [value, setValue];
}

/**
 * Persisted string state (raw, not JSON). Used for the editor source
 * buffer where JSON encoding would balloon size by ~2x.
 */
export function useLocalStorageString(key: string, initial: string): [string, (v: string | ((prev: string) => string)) => void] {
  const [value, setValue] = useState<string>(() => {
    try {
      return localStorage.getItem(key) ?? initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* */
    }
  }, [key, value]);

  return [value, setValue];
}
