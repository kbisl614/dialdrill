'use client';

interface CallStartConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  personalityName?: string;
  creditsRemaining: number | string;
  plan: 'trial' | 'paid';
  isOverage?: boolean;
  isRandomMode?: boolean;
  isLoading?: boolean;
}

export default function CallStartConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  personalityName,
  creditsRemaining,
  plan,
  isOverage = false,
  isRandomMode = false,
  isLoading = false,
}: CallStartConfirmationModalProps) {
  if (!isOpen) return null;

  const getCreditsLabel = () => {
    if (plan === 'trial') {
      return `${creditsRemaining} ${creditsRemaining === 1 || creditsRemaining === '1' ? 'call' : 'calls'} remaining`;
    } else {
      return isOverage
        ? 'Overage billing active ($1.00/call)'
        : `${creditsRemaining} minutes remaining`;
    }
  };

  const getWarningMessage = () => {
    if (plan === 'trial' && Number(creditsRemaining) === 1) {
      return 'This is your last trial call!';
    }
    if (isOverage) {
      return 'You will be charged $1.00 for this call.';
    }
    return null;
  };

  const warningMessage = getWarningMessage();

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-[#1A1F2E] shadow-2xl">
        {/* Header */}
        <div className="border-b border-white/10 bg-gradient-to-r from-[#00d9ff]/10 to-[#9d4edd]/10 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Start Practice Call?</h2>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
              aria-label="Close"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Personality Info */}
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#00d9ff] to-[#9d4edd] text-2xl">
                {isRandomMode ? '🎲' : '🗣️'}
              </div>
              <div>
                <p className="text-sm text-[#9ca3af]">Training with</p>
                <p className="text-lg font-bold text-white">
                  {isRandomMode ? 'Random Personality' : personalityName || 'Unknown'}
                </p>
              </div>
            </div>
          </div>

          {/* Credits Info */}
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-2xl">💳</div>
                <div>
                  <p className="text-sm text-[#9ca3af]">After this call</p>
                  <p className="text-sm font-semibold text-white">{getCreditsLabel()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Warning Message */}
          {warningMessage && (
            <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4">
              <div className="flex items-start gap-3">
                <div className="text-xl">⚠️</div>
                <div>
                  <p className="text-sm font-semibold text-yellow-300">{warningMessage}</p>
                  {plan === 'trial' && Number(creditsRemaining) === 1 && (
                    <p className="text-xs text-yellow-200/80 mt-1">
                      Consider upgrading to continue practicing after this call.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="rounded-xl border border-[#00d9ff]/20 bg-[#00d9ff]/5 p-4">
            <p className="text-xs font-semibold text-[#00d9ff] mb-2">💡 Quick Tips</p>
            <ul className="text-xs text-[#9ca3af] space-y-1">
              <li>• Speak clearly and naturally</li>
              <li>• Handle objections with confidence</li>
              <li>• Focus on value, not just features</li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-white/10 p-6 flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 rounded-full bg-gradient-to-r from-[#00d9ff] to-[#9d4edd] px-6 py-3 text-sm font-semibold text-white transition hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Starting...
              </>
            ) : (
              'Start Call'
            )}
          </button>
        </div>
      </div>
    </>
  );
}
