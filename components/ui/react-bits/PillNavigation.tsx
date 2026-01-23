'use client';

import { ReactNode } from 'react';

interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
}

interface PillNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  pillColor?: string;
  className?: string;
}

export default function PillNavigation({
  tabs,
  activeTab,
  onTabChange,
  pillColor = '#00d9ff',
  className = '',
}: PillNavigationProps) {
  const activeIndex = Math.max(0, tabs.findIndex((tab) => tab.id === activeTab));

  return (
    <div
      className={`relative p-1 rounded-full bg-[var(--color-border-subtle)] overflow-hidden ${className}`}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))`,
      }}
    >
      {/* Animated pill background */}
      <div
        className="absolute top-1 bottom-1 rounded-full transition-all duration-300 ease-out"
        style={{
          width: `calc(100% / ${tabs.length})`,
          backgroundColor: pillColor,
          transform: `translateX(${activeIndex * 100}%)`,
        }}
      />
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`relative z-10 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
            activeTab === tab.id ? 'text-[var(--color-dark-bg)]' : 'text-[var(--color-text-secondary)] hover:text-white'
          }`}
        >
          {tab.icon && <span>{tab.icon}</span>}
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
