import { useState, useCallback, useEffect } from 'react';

const PIN_STORAGE_KEY = 'primepost_pin_hash';
const UNLOCK_SESSION_KEY = 'primepost_unlocked';

function hashPin(pin: string): string {
  let hash = 0;
  for (let i = 0; i < pin.length; i++) {
    const char = pin.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

export function useLocalPin() {
  const [pinSet, setPinSet] = useState(() => {
    return localStorage.getItem(PIN_STORAGE_KEY) !== null;
  });

  const [isUnlocked, setIsUnlocked] = useState(() => {
    return sessionStorage.getItem(UNLOCK_SESSION_KEY) === 'true';
  });

  // Listen for storage changes to keep state in sync
  useEffect(() => {
    const handleStorageChange = () => {
      setPinSet(localStorage.getItem(PIN_STORAGE_KEY) !== null);
      setIsUnlocked(sessionStorage.getItem(UNLOCK_SESSION_KEY) === 'true');
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const isPinSet = useCallback(() => {
    return pinSet;
  }, [pinSet]);

  const setPin = useCallback((pin: string) => {
    const hashed = hashPin(pin);
    localStorage.setItem(PIN_STORAGE_KEY, hashed);
    sessionStorage.setItem(UNLOCK_SESSION_KEY, 'true');
    setPinSet(true);
    setIsUnlocked(true);
  }, []);

  const verifyPin = useCallback((pin: string): boolean => {
    const stored = localStorage.getItem(PIN_STORAGE_KEY);
    if (!stored) return false;
    return hashPin(pin) === stored;
  }, []);

  const unlock = useCallback(() => {
    sessionStorage.setItem(UNLOCK_SESSION_KEY, 'true');
    setIsUnlocked(true);
  }, []);

  const lock = useCallback(() => {
    sessionStorage.removeItem(UNLOCK_SESSION_KEY);
    setIsUnlocked(false);
  }, []);

  return {
    isPinSet,
    setPin,
    verifyPin,
    isUnlocked,
    unlock,
    lock,
  };
}
