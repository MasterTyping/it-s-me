'use client';

import { useEffect, useRef } from 'react';

export interface KeyState {
  w: boolean;
  a: boolean;
  s: boolean;
  d: boolean;
  space: boolean;
}

export class KeyboardController {
  private keyState: KeyState = {
    w: false,
    a: false,
    s: false,
    d: false,
    space: false,
  };

  private listeners: Set<(state: KeyState) => void> = new Set();

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('keydown', (e) => this.handleKeyDown(e));
    window.addEventListener('keyup', (e) => this.handleKeyUp(e));
  }

  private handleKeyDown(e: KeyboardEvent): void {
    const key = e.key.toLowerCase();

    switch (key) {
      case 'w':
        this.keyState.w = true;
        break;
      case 'a':
        this.keyState.a = true;
        break;
      case 's':
        this.keyState.s = true;
        break;
      case 'd':
        this.keyState.d = true;
        break;
      case ' ':
        e.preventDefault();
        this.keyState.space = true;
        break;
    }

    this.notifyListeners();
  }

  private handleKeyUp(e: KeyboardEvent): void {
    const key = e.key.toLowerCase();

    switch (key) {
      case 'w':
        this.keyState.w = false;
        break;
      case 'a':
        this.keyState.a = false;
        break;
      case 's':
        this.keyState.s = false;
        break;
      case 'd':
        this.keyState.d = false;
        break;
      case ' ':
        e.preventDefault();
        this.keyState.space = false;
        break;
    }

    this.notifyListeners();
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.keyState));
  }

  subscribe(listener: (state: KeyState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getState(): KeyState {
    return { ...this.keyState };
  }

  destroy(): void {
    this.listeners.clear();
  }
}

export function useKeyboardController() {
  const controllerRef = useRef<KeyboardController | null>(null);
  const keyStateRef = useRef<KeyState>({
    w: false,
    a: false,
    s: false,
    d: false,
    space: false,
  });

  useEffect(() => {
    controllerRef.current = new KeyboardController();

    const unsubscribe = controllerRef.current.subscribe((state) => {
      keyStateRef.current = state;
    });

    return () => {
      unsubscribe();
      controllerRef.current?.destroy();
    };
  }, []);

  return keyStateRef;
}
