'use client';

import { useState, useEffect } from 'react';
import { X, Keyboard } from 'lucide-react';
import { getDefaultShortcuts } from '@/hooks/useKeyboardShortcuts';

export default function KeyboardShortcutsModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleShow = () => setIsOpen(true);
    const handleEscape = () => setIsOpen(false);

    window.addEventListener('show-keyboard-help', handleShow);
    window.addEventListener('escape-pressed', handleEscape);

    return () => {
      window.removeEventListener('show-keyboard-help', handleShow);
      window.removeEventListener('escape-pressed', handleEscape);
    };
  }, []);

  if (!isOpen) return null;

  const shortcuts = getDefaultShortcuts();
  const categories = {
    navigation: shortcuts.filter((s) => s.category === 'navigation'),
    ui: shortcuts.filter((s) => s.category === 'ui'),
    search: shortcuts.filter((s) => s.category === 'search'),
    call: shortcuts.filter((s) => s.category === 'call'),
  };

  const KeyBadge = ({ keys }: { keys: string }) => (
    <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600">
      {keys}
    </kbd>
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden pointer-events-auto border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Keyboard className="w-6 h-6 mr-3" />
                <h2 className="text-2xl font-bold">Keyboard Shortcuts</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-purple-100 text-sm mt-2">
              Use these shortcuts to navigate DialDrill faster
            </p>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
            <div className="space-y-6">
              {/* Navigation */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Navigation
                </h3>
                <div className="space-y-2">
                  {categories.navigation.map((shortcut, index) => (
                    <div key={index} className="flex items-center justify-between py-2">
                      <span className="text-gray-700 dark:text-gray-300">{shortcut.description}</span>
                      <KeyBadge keys={shortcut.key.toUpperCase()} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Search */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Search
                </h3>
                <div className="space-y-2">
                  {categories.search.map((shortcut, index) => (
                    <div key={index} className="flex items-center justify-between py-2">
                      <span className="text-gray-700 dark:text-gray-300">{shortcut.description}</span>
                      <KeyBadge keys={shortcut.key === '/' ? '/' : shortcut.key.toUpperCase()} />
                    </div>
                  ))}
                </div>
              </div>

              {/* UI Controls */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  UI Controls
                </h3>
                <div className="space-y-2">
                  {categories.ui.map((shortcut, index) => (
                    <div key={index} className="flex items-center justify-between py-2">
                      <span className="text-gray-700 dark:text-gray-300">{shortcut.description}</span>
                      <KeyBadge
                        keys={
                          shortcut.key === '?'
                            ? '?'
                            : shortcut.key === 'Escape'
                              ? 'ESC'
                              : shortcut.key.toUpperCase()
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Call Controls */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  During Calls
                </h3>
                <div className="space-y-2">
                  {categories.call.map((shortcut, index) => (
                    <div key={index} className="flex items-center justify-between py-2">
                      <span className="text-gray-700 dark:text-gray-300">{shortcut.description}</span>
                      <KeyBadge
                        keys={
                          shortcut.key === 'Space'
                            ? 'SPACE'
                            : shortcut.key === 'Escape'
                              ? 'ESC'
                              : shortcut.key.toUpperCase()
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Press <KeyBadge keys="?" /> anytime to see this help
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
