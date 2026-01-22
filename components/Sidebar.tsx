'use client';

import { SignOutButton } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useSidebar } from './SidebarContext';

export default function Sidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isCollapsed, setIsCollapsed } = useSidebar();

  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      name: 'Call History',
      href: '/history',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      name: 'Performance',
      href: '/performance',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      name: 'Plans',
      href: '/plans',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden border-b border-[var(--color-border-subtle)]/50 bg-[var(--color-dark-bg)]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex h-16 items-center justify-between px-4">
          <Link href="/dashboard" className="text-xl font-extrabold text-white">
            Dial<span className="text-[var(--color-cyan-bright)]">Drill</span>
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex items-center justify-center h-10 w-10 rounded-lg border border-white/10 bg-white/5 text-white transition-colors hover:bg-white/10"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="border-t border-[var(--color-border-subtle)]/50 bg-[var(--color-dark-bg)]/95 backdrop-blur-xl">
            <nav className="px-4 py-4 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    title={item.name}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-[var(--color-cyan-bright)]/20 to-transparent text-white border-l-2 border-[var(--color-cyan-bright)]'
                        : 'text-[var(--color-text-secondary)] hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {item.icon}
                    {item.name}
                  </Link>
                );
              })}
              <div className="pt-4 border-t border-[var(--color-border-subtle)]/50">
                <SignOutButton>
                  <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-[var(--color-text-secondary)] transition-all hover:bg-white/5 hover:text-white">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                  </button>
                </SignOutButton>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:border-r lg:border-[var(--color-border-subtle)]/50 lg:bg-[#0a1120]/95 lg:backdrop-blur-xl transition-all duration-300 ${
        isCollapsed ? 'lg:w-20' : 'lg:w-64'
      }`}>
        {/* Logo */}
        <div className="flex h-20 items-center justify-between px-6 border-b border-[var(--color-border-subtle)]/50">
          {!isCollapsed && (
            <Link href="/dashboard" className="text-2xl font-extrabold text-white">
              Dial<span className="text-[var(--color-cyan-bright)]">Drill</span>
            </Link>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`flex items-center justify-center h-8 w-8 rounded-lg border border-white/10 bg-white/5 text-white transition-colors hover:bg-white/10 ${
              isCollapsed ? 'mx-auto' : ''
            }`}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg className={`h-5 w-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.name}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-[var(--color-cyan-bright)]/20 to-transparent text-white shadow-lg border-l-4 border-[var(--color-cyan-bright)]'
                    : 'text-[var(--color-text-secondary)] hover:bg-white/5 hover:text-white'
                } ${isCollapsed ? 'justify-center' : ''}`}
              >
                {item.icon}
                {!isCollapsed && item.name}
              </Link>
            );
          })}
        </nav>

        {/* Sign Out Button */}
        <div className="px-4 py-6 border-t border-[var(--color-border-subtle)]/50">
          <SignOutButton>
            <button
              title="Sign out of your account"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--color-border-subtle)]/50 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10 hover:border-[var(--color-border-medium)]">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {!isCollapsed && 'Sign Out'}
            </button>
          </SignOutButton>
        </div>
      </aside>
    </>
  );
}
