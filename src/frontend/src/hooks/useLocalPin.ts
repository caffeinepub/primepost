import { useState, useCallback, useEffect, useSyncExternalStore } from 'react';
import { pinSessionStore } from '../state/pinSessionStore';

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
  // Use React's useSyncExternalStore for reactive state
  const state = useSyncExternalStore(
    (callback) => pinSessionStore.subscribe(callback),
    () => pinSessionStore.getState(),
    () => pinSessionStore.getState()
  );

  const isPinSet = useCallback(() => {
    return state.pinSet;
  }, [state.pinSet]);

  const setPin = useCallback((pin: string) => {
    try {
      const hashed = hashPin(pin);
      localStorage.setItem(PIN_STORAGE_KEY, hashed);
      sessionStorage.setItem(UNLOCK_SESSION_KEY, 'true');
      
      // Update reactive store
      pinSessionStore.setPinSet(true);
      pinSessionStore.setUnlocked(true);
    } catch (error) {
      console.error('Failed to save PIN:', error);
      throw new Error('Failed to save PIN. Please check your browser storage settings.');
    }
  }, []);

  const verifyPin = useCallback((pin: string): boolean => {
    try {
      const stored = localStorage.getItem(PIN_STORAGE_KEY);
      if (!stored) return false;
      return hashPin(pin) === stored;
    } catch (error) {
      console.error('Failed to verify PIN:', error);
      return false;
    }
  }, []);

  const unlock = useCallback(() => {
    try {
      sessionStorage.setItem(UNLOCK_SESSION_KEY, 'true');
      
      // Update reactive store immediately
      pinSessionStore.setUnlocked(true);
    } catch (error) {
      console.error('Failed to unlock:', error);
      throw new Error('Failed to unlock. Please check your browser storage settings.');
    }
  }, []);

  const lock = useCallback(() => {
    try {
      sessionStorage.removeItem(UNLOCK_SESSION_KEY);
      
      // Update reactive store immediately
      pinSessionStore.setUnlocked(false);
    } catch (error) {
      console.error('Failed to lock:', error);
      throw new Error('Failed to lock session.');
    }
  }, []);

  return {
    isPinSet,
    setPin,
    verifyPin,
    isUnlocked: state.unlocked,
    unlock,
    lock,
  };
}
