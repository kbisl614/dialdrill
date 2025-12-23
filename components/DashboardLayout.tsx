'use client';

import { type ReactNode } from 'react';
import Sidebar from './Sidebar';
import { SidebarProvider, useSidebar } from './SidebarContext';

function DashboardLayoutContent({ children }: { children: ReactNode }) {
  const { isCollapsed } = useSidebar();

  return (
    <>
      <Sidebar />
      <main className={`min-h-screen bg-[#080d1a] grid-background transition-all duration-300 ${
        isCollapsed ? 'lg:pl-20' : 'lg:pl-64'
      }`}>
        {children}
      </main>
    </>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </SidebarProvider>
  );
}
