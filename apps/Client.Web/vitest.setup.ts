import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { i18n } from '@lingui/core';
import { messages as enMessages } from './src/locales/en/messages';

// Setup lingui i18n
i18n.load('en', enMessages);
i18n.activate('en');

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Setup global mocks
(global as any).jest = vi;

// Filter process warnings that are environmental and spammy in local dev.
// This suppresses the `--localstorage-file` warning emitted by some node/jsdom
// combos. We keep other warnings intact.
const originalEmitWarning = process.emitWarning.bind(process);
process.emitWarning = (warning: string | Error, ...args: any[]) => {
  try {
    const msg = typeof warning === 'string' ? warning : warning?.message || '';
    if (msg.includes('--localstorage-file')) return;
  } catch {
    // ignore
  }

  originalEmitWarning(warning as any, ...args);
};

// Let React know we're running in a test environment so it can avoid
// noisy act(...) warnings when test utils manage updates.
// See React testing recommendations for IS_REACT_ACT_ENVIRONMENT.
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Ensure window.localStorage exists and has the usual methods. Some local
// environments of jsdom or node may provide an incomplete implementation or
// a proxy that doesn't expose functions, causing `getItem` to be undefined.
// CI likely provides a full implementation which is why tests pass there.
if (!window.localStorage || typeof window.localStorage.getItem !== 'function') {
  const store: Record<string, string> = {};

  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key: string) => (key in store ? store[key] : null),
      setItem: (key: string, value: string) => {
        store[key] = String(value);
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        Object.keys(store).forEach(k => delete store[k]);
      },
    },
  });
}

// Suppress noisy warnings in tests that are non-actionable for now:
// - React "not wrapped in act(...)" warnings (tests still assert correctly).
// - Node/jsdom `--localstorage-file` warning that appears on some environments.
// Filter these out from console.error so they don't spam CI/dev output.
const originalConsoleError = console.error.bind(console);
console.error = (...args: unknown[]) => {
  try {
    const msg = args
      .map(a => (typeof a === 'string' ? a : JSON.stringify(a)))
      .join(' ');

    if (
      msg.includes('not wrapped in act(') ||
      msg.includes('--localstorage-file')
    ) {
      return;
    }
  } catch {
    // ignore JSON stringify errors
  }

  originalConsoleError(...args);
};
