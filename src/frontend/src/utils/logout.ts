import { QueryClient } from '@tanstack/react-query';
import { pinSessionStore } from '../state/pinSessionStore';
import { useCartStore } from '../state/cartStore';

interface LogoutOptions {
  clearIdentity: () => void;
  queryClient: QueryClient;
  isAndroid?: boolean;
}

// Global logout epoch to force actor recreation
let logoutEpoch = 0;

export function getLogoutEpoch(): number {
  return logoutEpoch;
}

export function incrementLogoutEpoch(): void {
  logoutEpoch++;
}

/**
 * Centralized logout helper that clears all session state:
 * - Internet Identity session (including IndexedDB)
 * - React Query cache
 * - PIN unlock session (sessionStorage + pinSessionStore)
 * - Persisted cart state (zustand storage + in-memory)
 * - Forces actor to anonymous immediately
 * - Uses history-replacing navigation to prevent back button issues
 */
export async function performLogout({ clearIdentity, queryClient, isAndroid = false }: LogoutOptions): Promise<void> {
  try {
    // 1. Increment logout epoch to force actor to anonymous immediately
    incrementLogoutEpoch();

    // 2. Clear Internet Identity session and IndexedDB
    try {
      clearIdentity();
      
      // Best-effort clear Internet Identity IndexedDB databases
      if (window.indexedDB) {
        try {
          // Common Internet Identity database names
          const dbNames = ['auth-client-db', 'ic-keyval'];
          for (const dbName of dbNames) {
            indexedDB.deleteDatabase(dbName);
          }
        } catch (e) {
          console.warn('Failed to clear IndexedDB:', e);
        }
      }
    } catch (e) {
      console.warn('Failed to clear Internet Identity:', e);
    }

    // 3. Clear React Query cache (including actor cache)
    queryClient.clear();

    // 4. Clear PIN unlock session
    try {
      sessionStorage.removeItem('primepost_unlocked');
      pinSessionStore.setUnlocked(false);
    } catch (e) {
      console.warn('Failed to clear PIN session:', e);
    }

    // 5. Clear persisted cart state
    clearCartState();

    // 6. Clear any other PrimePost-related storage keys
    clearAppStorage();

    // 7. Navigate with history replacement to prevent back button issues
    await navigateToHome(isAndroid);
  } catch (error) {
    console.error('Logout error:', error);
    // Even if logout fails, clear local state
    incrementLogoutEpoch();
    queryClient.clear();
    clearCartState();
    clearAppStorage();
    await navigateToHome(isAndroid);
  }
}

/**
 * Full cleanup after factory reset:
 * - Clears Internet Identity session
 * - Clears all React Query cache
 * - Clears PIN session and stored PIN hash
 * - Clears cart persisted state
 * - Removes any other PrimePost session/local storage keys
 */
export async function performFactoryResetCleanup({ clearIdentity, queryClient, isAndroid = false }: LogoutOptions): Promise<void> {
  try {
    // 1. Increment logout epoch
    incrementLogoutEpoch();

    // 2. Clear Internet Identity session and IndexedDB
    try {
      clearIdentity();
      
      if (window.indexedDB) {
        try {
          const dbNames = ['auth-client-db', 'ic-keyval'];
          for (const dbName of dbNames) {
            indexedDB.deleteDatabase(dbName);
          }
        } catch (e) {
          console.warn('Failed to clear IndexedDB:', e);
        }
      }
    } catch (e) {
      console.warn('Failed to clear Internet Identity:', e);
    }

    // 3. Clear React Query cache
    queryClient.clear();

    // 4. Clear PIN unlock session and stored PIN hash
    try {
      sessionStorage.removeItem('primepost_unlocked');
      localStorage.removeItem('primepost_pin_hash');
      pinSessionStore.setUnlocked(false);
      pinSessionStore.setPinSet(false);
    } catch (e) {
      console.warn('Failed to clear PIN data:', e);
    }

    // 5. Clear persisted cart state
    clearCartState();

    // 6. Clear any other PrimePost-related storage keys
    clearAppStorage();

    // 7. Navigate with history replacement
    await navigateToHome(isAndroid);
  } catch (error) {
    console.error('Factory reset cleanup error:', error);
    // Even if cleanup fails, clear what we can
    incrementLogoutEpoch();
    queryClient.clear();
    try {
      sessionStorage.clear();
      localStorage.clear();
    } catch (e) {
      // Ignore storage errors
    }
    await navigateToHome(isAndroid);
  }
}

/**
 * Clear cart state from both storage and memory
 */
function clearCartState(): void {
  try {
    localStorage.removeItem('primepost-cart');
    const cartState = useCartStore.getState();
    Object.keys(cartState.items).forEach(storeId => {
      cartState.clearCart(storeId);
    });
  } catch (e) {
    console.warn('Failed to clear cart:', e);
  }
}

/**
 * Clear all PrimePost-related storage keys
 */
function clearAppStorage(): void {
  try {
    const keysToRemove: string[] = [];
    
    // Collect localStorage keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('primepost')) {
        keysToRemove.push(key);
      }
    }
    
    // Remove collected keys
    keysToRemove.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.warn(`Failed to remove ${key}:`, e);
      }
    });
  } catch (e) {
    console.warn('Failed to clear app storage:', e);
  }
}

/**
 * Navigate to home with history replacement to prevent back button issues
 */
async function navigateToHome(isAndroid: boolean): Promise<void> {
  // Small delay to ensure cleanup completes
  await new Promise(resolve => setTimeout(resolve, 100));
  
  if (isAndroid) {
    // Android WebView: Force hard navigation
    window.location.href = '/';
  } else {
    // Web: Use history replacement to prevent back button from restoring auth state
    window.history.replaceState(null, '', '/');
    window.location.href = '/';
  }
}
