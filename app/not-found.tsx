import Link from 'next/link';
import Button from '@/components/ui/Button';

export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#020817] grid-background">
      {/* Header */}
      <header className="border-b border-white/5 bg-[#020817]/80 backdrop-blur-xl">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-12">
          <div className="flex h-20 items-center justify-between">
            <Link href="/" className="text-2xl font-extrabold text-white hover:opacity-80 transition-opacity">
              Dial<span className="text-[var(--color-cyan-bright)]">Drill</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 404 Content */}
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4">
        <div className="text-center max-w-2xl">
          <div className="mb-8 inline-flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-[var(--color-cyan-bright)]/20 to-[var(--color-cyan-bright)]/5 ring-2 ring-[var(--color-cyan-bright)]/30">
            <svg className="h-12 w-12 text-[var(--color-cyan-bright)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-7xl font-extrabold text-white mb-4">404</h1>
          <p className="text-2xl text-[var(--color-text-secondary)] mb-8">Page not found</p>
          <p className="text-lg text-[var(--color-text-secondary)] mb-10 max-w-md mx-auto">
            The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get you back on track.
          </p>
          <Link href="/" >
            <Button variant="primary" size="md">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
