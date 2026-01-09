'use client';

interface SkeletonLoaderProps {
  variant?: 'stat' | 'notification' | 'badge' | 'leaderboard' | 'text' | 'circle';
  count?: number;
  className?: string;
}

export default function SkeletonLoader({ variant = 'text', count = 1, className = '' }: SkeletonLoaderProps) {
  const items = Array.from({ length: count }, (_, i) => i);

  if (variant === 'stat') {
    return (
      <div className="space-y-3">
        {items.map((i) => (
          <div key={i} className={`flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] p-4 ${className}`}>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-white/10 animate-pulse" />
              <div className="h-4 w-32 rounded bg-white/10 animate-pulse" />
            </div>
            <div className="h-6 w-16 rounded bg-white/10 animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'notification') {
    return (
      <div className="space-y-3">
        {items.map((i) => (
          <div key={i} className={`rounded-lg border border-white/10 bg-white/[0.02] p-4 ${className}`}>
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-white/10 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded bg-white/10 animate-pulse" />
                <div className="h-3 w-full rounded bg-white/10 animate-pulse" />
                <div className="h-3 w-1/4 rounded bg-white/10 animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'badge') {
    return (
      <div className="grid grid-cols-2 gap-3">
        {items.map((i) => (
          <div key={i} className={`rounded-lg border border-white/10 bg-white/[0.02] p-3 ${className}`}>
            <div className="h-10 w-10 rounded-lg bg-white/10 animate-pulse mb-2" />
            <div className="h-4 w-3/4 rounded bg-white/10 animate-pulse mb-2" />
            <div className="h-3 w-full rounded bg-white/10 animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'leaderboard') {
    return (
      <div className="space-y-2">
        {items.map((i) => (
          <div key={i} className={`flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] p-3 ${className}`}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white/10 animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-24 rounded bg-white/10 animate-pulse" />
                <div className="h-3 w-16 rounded bg-white/10 animate-pulse" />
              </div>
            </div>
            <div className="text-right space-y-2">
              <div className="h-5 w-16 rounded bg-white/10 animate-pulse ml-auto" />
              <div className="h-3 w-12 rounded bg-white/10 animate-pulse ml-auto" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'circle') {
    return (
      <div className="flex items-center justify-center">
        {items.map((i) => (
          <div key={i} className={`h-12 w-12 rounded-full bg-white/10 animate-pulse ${className}`} />
        ))}
      </div>
    );
  }

  // Default text variant
  return (
    <div className="space-y-2">
      {items.map((i) => (
        <div key={i} className={`h-4 rounded bg-white/10 animate-pulse ${className}`} />
      ))}
    </div>
  );
}
