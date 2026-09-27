/**
 * Safe persistence utility for Ember & Oracle.
 * Transparently bridges synchronous localStorage with the asynchronous window.storage API.
 * Prevents [object Promise] serialization and JSON parsing errors.
 */

export function getSafeLocalStorage(key: string): string | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const val = localStorage.getItem(key);
    if (!val || val === '[object Promise]' || val === 'undefined' || val === 'null') {
      if (val === '[object Promise]') {
        localStorage.removeItem(key);
      }
      return null;
    }
    return val;
  } catch (e) {
    return null;
  }
}

export function setSafeStorage(key: string, value: string): void {
  if (typeof window === 'undefined') return;

  // 1. Synchronously persist to localStorage
  try {
    if (window.localStorage) {
      localStorage.setItem(key, value);
    }
  } catch (e) {
    // Ignore quota or private-browsing errors
  }

  // 2. Asynchronously notify window.storage if available
  try {
    if ((window as any).storage && typeof (window as any).storage.set === 'function') {
      Promise.resolve((window as any).storage.set(key, value)).catch(() => {});
    }
  } catch (e) {
    // Non-blocking
  }
}

export async function getSafeStorageAsync(key: string): Promise<string | null> {
  // First check window.storage if present
  if (typeof window !== 'undefined' && (window as any).storage && typeof (window as any).storage.get === 'function') {
    try {
      const res = await (window as any).storage.get(key);
      if (res) {
        let extracted: any = res;
        if (typeof res === 'object' && 'value' in res) {
          extracted = res.value;
        }
        if (typeof extracted === 'string' && extracted !== '[object Promise]' && extracted !== 'undefined') {
          return extracted;
        }
        if (typeof extracted === 'object' && extracted !== null) {
          return JSON.stringify(extracted);
        }
      }
    } catch (e) {
      // Fall through to localStorage
    }
  }

  return getSafeLocalStorage(key);
}

export function safeJsonParse<T>(raw: any, fallback: T): T {
  if (raw === null || raw === undefined) return fallback;
  if (typeof raw === 'object') return raw as T;
  if (typeof raw !== 'string') return fallback;

  const trimmed = raw.trim();
  if (!trimmed || trimmed === '[object Promise]' || trimmed === 'undefined' || trimmed === 'null') {
    return fallback;
  }

  try {
    return JSON.parse(trimmed) as T;
  } catch (e) {
    return fallback;
  }
}

/**
 * Purges cached altar states, user sessions, and local sovereign artifacts.
 */
export function clearAppCache(): void {
  if (typeof window === 'undefined') return;

  const standardKeys = [
    'ember_oracle_user_v1',
    'ember_oracle_tier_v1',
    'ember_oracle_history_v1',
    'altar_charge',
    'goetic_channeling_ledger',
    'ritual_counts',
    'tarot_daily_pull',
    'tarot_favorites'
  ];

  try {
    if (window.localStorage) {
      standardKeys.forEach(k => {
        try { localStorage.removeItem(k); } catch (_) {}
      });

      // Clear dynamic keys (altar:*, doc_state_*, etc.)
      const toRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('altar:') || key.startsWith('doc_state_') || key.includes('admin') || key.includes('super'))) {
          toRemove.push(key);
        }
      }
      toRemove.forEach(k => {
        try { localStorage.removeItem(k); } catch (_) {}
      });
    }
  } catch (e) {
    // Ignore errors
  }
}
