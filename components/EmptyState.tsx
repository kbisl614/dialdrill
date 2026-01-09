'use client';

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="text-6xl mb-4 animate-bounce">{icon}</div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-[#9ca3af] max-w-md mb-6">{description}</p>
      {(actionLabel && (actionHref || onAction)) && (
        <>
          {actionHref ? (
            <a
              href={actionHref}
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#00d9ff] to-[#9d4edd] px-6 py-3 text-sm font-semibold text-white transition hover:scale-105 shadow-lg hover:shadow-xl"
            >
              {actionLabel}
            </a>
          ) : (
            <button
              onClick={onAction}
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#00d9ff] to-[#9d4edd] px-6 py-3 text-sm font-semibold text-white transition hover:scale-105 shadow-lg hover:shadow-xl"
            >
              {actionLabel}
            </button>
          )}
        </>
      )}
    </div>
  );
}
