/**
 * Keyboard Shortcuts Hook
 * Global keyboard shortcut management for DialDrill
 */

'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  description: string;
  action: () => void;
  category: 'navigation' | 'call' | 'ui' | 'search';
}

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  shortcuts?: KeyboardShortcut[];
}

/**
 * Global keyboard shortcuts
 */
export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions = {}) {
  const { enabled = true, shortcuts = [] } = options;
  const router = useRouter();

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Allow Escape to blur inputs
        if (event.key === 'Escape') {
          target.blur();
        }
        return;
      }

      // Check custom shortcuts first
      for (const shortcut of shortcuts) {
        if (
          event.key.toLowerCase() === shortcut.key.toLowerCase() &&
          event.ctrlKey === (shortcut.ctrl || false) &&
          event.shiftKey === (shortcut.shift || false) &&
          event.altKey === (shortcut.alt || false) &&
          event.metaKey === (shortcut.meta || false)
        ) {
          event.preventDefault();
          shortcut.action();
          return;
        }
      }

      // Global shortcuts
      switch (event.key) {
        case '?':
          // Show help modal
          event.preventDefault();
          const helpEvent = new CustomEvent('show-keyboard-help');
          window.dispatchEvent(helpEvent);
          break;

        case '/':
          // Focus search
          event.preventDefault();
          const searchInput = document.querySelector<HTMLInputElement>('[data-search-input]');
          if (searchInput) {
            searchInput.focus();
          }
          break;

        case 'Escape':
          // Close modals, blur search
          event.preventDefault();
          const escapeEvent = new CustomEvent('escape-pressed');
          window.dispatchEvent(escapeEvent);
          break;

        case 'd':
          // Go to dashboard
          if (!event.ctrlKey && !event.metaKey) {
            event.preventDefault();
            router.push('/dashboard');
          }
          break;

        case 'h':
          // Go to history
          if (!event.ctrlKey && !event.metaKey) {
            event.preventDefault();
            router.push('/history');
          }
          break;

        case 'p':
          // Go to performance
          if (!event.ctrlKey && !event.metaKey) {
            event.preventDefault();
            router.push('/performance');
          }
          break;

        case 'n':
          // Toggle notifications
          if (!event.ctrlKey && !event.metaKey) {
            event.preventDefault();
            const notifEvent = new CustomEvent('toggle-notifications');
            window.dispatchEvent(notifEvent);
          }
          break;
      }
    },
    [shortcuts, router]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [enabled, handleKeyPress]);
}

/**
 * Get all available keyboard shortcuts
 */
export function getDefaultShortcuts(): KeyboardShortcut[] {
  return [
    // Navigation
    {
      key: 'd',
      description: 'Go to Dashboard',
      action: () => {},
      category: 'navigation',
    },
    {
      key: 'h',
      description: 'Go to History',
      action: () => {},
      category: 'navigation',
    },
    {
      key: 'p',
      description: 'Go to Performance',
      action: () => {},
      category: 'navigation',
    },

    // UI
    {
      key: 'n',
      description: 'Toggle Notifications',
      action: () => {},
      category: 'ui',
    },
    {
      key: '?',
      description: 'Show Keyboard Shortcuts',
      action: () => {},
      category: 'ui',
    },
    {
      key: 'Escape',
      description: 'Close Modals / Blur Input',
      action: () => {},
      category: 'ui',
    },

    // Search
    {
      key: '/',
      description: 'Focus Search',
      action: () => {},
      category: 'search',
    },

    // Call controls (context-specific)
    {
      key: 'Space',
      description: 'Mute/Unmute (during call)',
      action: () => {},
      category: 'call',
    },
    {
      key: 'Escape',
      description: 'End Call (during call)',
      action: () => {},
      category: 'call',
    },
  ];
}
