'use client';

import { useState } from 'react';
import { Search, Filter, Download, X, Calendar, User, BarChart3 } from 'lucide-react';

interface Personality {
  id: string;
  name: string;
}

interface CallHistoryFiltersProps {
  personalities: Personality[];
  onFilterChange: (filters: FilterState) => void;
  onExportAll: () => void;
  totalCalls: number;
  filteredCalls: number;
}

export interface FilterState {
  search: string;
  personalityId: string;
  dateRange: 'all' | '7d' | '30d' | '90d';
  minScore: number;
  maxScore: number;
}

export default function CallHistoryFilters({
  personalities,
  onFilterChange,
  onExportAll,
  totalCalls,
  filteredCalls,
}: CallHistoryFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    personalityId: 'all',
    dateRange: 'all',
    minScore: 0,
    maxScore: 10,
  });

  const updateFilter = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const defaultFilters: FilterState = {
      search: '',
      personalityId: 'all',
      dateRange: 'all',
      minScore: 0,
      maxScore: 10,
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  const activeFilterCount = [
    filters.search !== '',
    filters.personalityId !== 'all',
    filters.dateRange !== 'all',
    filters.minScore > 0 || filters.maxScore < 10,
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Main Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search transcripts..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            data-search-input
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
          />
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-colors ${
            showFilters || activeFilterCount > 0
              ? 'bg-purple-600 text-white border-purple-600'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          <Filter className="w-4 h-4" />
          <span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && (
            <span className="bg-white text-purple-600 text-xs font-bold px-1.5 py-0.5 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Export */}
        <button
          onClick={onExportAll}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export</span>
        </button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Personality Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                Personality
              </label>
              <select
                value={filters.personalityId}
                onChange={(e) => updateFilter('personalityId', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Personalities</option>
                {personalities.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date Range
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => updateFilter('dateRange', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Time</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
            </div>

            {/* Score Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Score Range: {filters.minScore} - {filters.maxScore}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={filters.minScore}
                  onChange={(e) => updateFilter('minScore', parseFloat(e.target.value))}
                  className="flex-1"
                />
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={filters.maxScore}
                  onChange={(e) => updateFilter('maxScore', parseFloat(e.target.value))}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          {/* Filter Actions */}
          {activeFilterCount > 0 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing {filteredCalls} of {totalCalls} calls
              </p>
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
              >
                <X className="w-4 h-4" />
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Results Count */}
      {!showFilters && filteredCalls !== totalCalls && (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredCalls} of {totalCalls} calls
        </p>
      )}
    </div>
  );
}
