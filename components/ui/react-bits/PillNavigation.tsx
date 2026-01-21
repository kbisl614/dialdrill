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
  textColor?: string;
  activeTextColor?: string;
  className?: string;
}

export default function PillNavigation({
  tabs,
  activeTab,
  onTabChange,
  pillColor = '#00d9ff',
  textColor = 'rgba(156, 163, 175, 1)',
  activeTextColor = '#080d1a',
  className = '',
}: PillNavigationProps) {
  const activeIndex = tabs.findIndex((tab) => tab.id === activeTab);

  return (
    <div className={`relative inline-flex gap-2 p-1 rounded-full bg-[#1e293b] ${className}`}>
      {/* Animated pill background */}
      <div
        className="absolute top-1 bottom-1 rounded-full transition-all duration-300 ease-out"
        style={{
          left: `${(activeIndex * 100) / tabs.length + (100 / tabs.length) * 0.1}%`,
          width: `${(100 / tabs.length) * 0.8}%`,
          backgroundColor: pillColor,
          transform: `translateX(${activeIndex * -100}%)`,
        }}
      />
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`relative z-10 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeTab === tab.id ? 'text-[#080d1a]' : 'text-[#9ca3af] hover:text-white'
          }`}
        >
          {tab.icon && <span>{tab.icon}</span>}
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}

