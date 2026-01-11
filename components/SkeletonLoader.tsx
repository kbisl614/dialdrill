interface SkeletonLoaderProps {
  variant?: 'stat' | 'notification' | 'badge' | 'leaderboard' | 'text' | 'circle';
  count?: number;
  className?: string;
}

export default function SkeletonLoader({
  variant = 'text',
  count = 1,
  className = '',
}: SkeletonLoaderProps) {
  const baseClasses = 'animate-pulse bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg';

  const renderSkeleton = () => {
    switch (variant) {
      case 'stat':
        return (
          <div className={`${baseClasses} p-6 border border-white/10`}>
            <div className="h-4 w-20 bg-gray-700 rounded mb-3"></div>
            <div className="h-8 w-24 bg-gray-600 rounded mb-2"></div>
            <div className="h-3 w-32 bg-gray-700 rounded"></div>
          </div>
        );

      case 'notification':
        return (
          <div className={`${baseClasses} p-4 border border-white/10`}>
            <div className="flex gap-3">
              <div className="h-10 w-10 bg-gray-700 rounded-full flex-shrink-0"></div>
              <div className="flex-1">
                <div className="h-4 w-3/4 bg-gray-700 rounded mb-2"></div>
                <div className="h-3 w-1/2 bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        );

      case 'badge':
        return (
          <div className={`${baseClasses} p-6 border border-white/10`}>
            <div className="flex items-center gap-4 mb-4">
              <div className="h-12 w-12 bg-gray-700 rounded-full"></div>
              <div className="flex-1">
                <div className="h-5 w-32 bg-gray-700 rounded mb-2"></div>
                <div className="h-3 w-24 bg-gray-700 rounded"></div>
              </div>
            </div>
            <div className="h-3 w-full bg-gray-700 rounded mb-2"></div>
            <div className="h-3 w-4/5 bg-gray-700 rounded"></div>
          </div>
        );

      case 'leaderboard':
        return (
          <div className={`${baseClasses} p-4 border border-white/10`}>
            <div className="flex items-center gap-4">
              <div className="h-8 w-8 bg-gray-700 rounded"></div>
              <div className="h-10 w-10 bg-gray-700 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 w-32 bg-gray-700 rounded mb-2"></div>
                <div className="h-3 w-20 bg-gray-700 rounded"></div>
              </div>
              <div className="h-6 w-16 bg-gray-700 rounded"></div>
            </div>
          </div>
        );

      case 'circle':
        return (
          <div className={`${baseClasses} h-16 w-16 rounded-full ${className}`}></div>
        );

      case 'text':
      default:
        return (
          <div className={`${baseClasses} h-4 w-full ${className}`}></div>
        );
    }
  };

  if (count === 1) {
    return renderSkeleton();
  }

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>{renderSkeleton()}</div>
      ))}
    </>
  );
}
