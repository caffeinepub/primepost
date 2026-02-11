// In-tab reactive store for PIN session state
// Solves the issue where storage events don't fire in the same tab

type Listener = () => void;

interface PinSessionState {
  pinSet: boolean;
  unlocked: boolean;
}

class PinSessionStore {
  private listeners: Set<Listener> = new Set();
  private state: PinSessionState;

  constructor() {
    // Initialize from storage
    this.state = {
      pinSet: localStorage.getItem('primepost_pin_hash') !== null,
      unlocked: sessionStorage.getItem('primepost_unlocked') === 'true',
    };
  }

  getState(): PinSessionState {
    return this.state;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  setPinSet(value: boolean): void {
    this.state = { ...this.state, pinSet: value };
    this.notify();
  }

  setUnlocked(value: boolean): void {
    this.state = { ...this.state, unlocked: value };
    this.notify();
  }

  reset(): void {
    this.state = { pinSet: false, unlocked: false };
    this.notify();
  }

  private notify(): void {
    this.listeners.forEach(listener => listener());
  }
}

export const pinSessionStore = new PinSessionStore();
