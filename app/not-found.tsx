import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#020817] grid-background">
      {/* Header */}
      <header className="border-b border-white/5 bg-[#020817]/80 backdrop-blur-xl">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-12">
          <div className="flex h-20 items-center justify-between">
            <Link href="/" className="text-2xl font-extrabold text-white hover:opacity-80 transition-opacity">
              Dial<span className="text-[#00d9ff]">Drill</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 404 Content */}
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4">
        <div className="text-center max-w-2xl">
          <div className="mb-8 inline-flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-[#00d9ff]/20 to-[#00d9ff]/5 ring-2 ring-[#00d9ff]/30">
            <svg className="h-12 w-12 text-[#00d9ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-7xl font-extrabold text-white mb-4">404</h1>
          <p className="text-2xl text-[#9ca3af] mb-8">Page not found</p>
          <p className="text-lg text-[#9ca3af] mb-10 max-w-md mx-auto">
            The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get you back on track.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#00d9ff] to-[#00ffea] px-8 py-4 text-base font-semibold text-[#020817] transition-all hover:scale-105 shadow-[0_0_40px_rgba(0,217,255,0.6)] hover:shadow-[0_0_60px_rgba(0,255,234,0.8)]"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
