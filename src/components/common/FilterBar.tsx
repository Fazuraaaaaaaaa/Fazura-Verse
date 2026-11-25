import React, { useState } from 'react';
import { Search, SlidersHorizontal, RotateCcw, X } from 'lucide-react';
import { CATEGORY_THEMES, type MediaCategory } from '../../utils/categoryTheme';
import { Button } from './Button';

export interface FilterTabOption {
  id: string;
  label: string;
  count?: number;
}

export interface SelectOption {
  value: string;
  label: string;
}

interface FilterBarProps {
  category: MediaCategory;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  onSearchSubmit?: (e: React.FormEvent) => void;
  searchPlaceholder?: string;

  tabs?: FilterTabOption[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;

  genreOptions?: SelectOption[];
  selectedGenre?: string;
  onGenreChange?: (genre: string) => void;
  genreLabel?: string;

  sortOptions?: SelectOption[];
  selectedSort?: string;
  onSortChange?: (sort: string) => void;

  extraControl?: React.ReactNode;
  hasActiveFilters?: boolean;
  onResetFilters?: () => void;
}

export function FilterBar({
  category,
  searchValue = '',
  onSearchChange,
  onSearchSubmit,
  searchPlaceholder = 'Cari judul...',
  tabs,
  activeTab,
  onTabChange,
  genreOptions,
  selectedGenre = '',
  onGenreChange,
  genreLabel = 'Semua Genre',
  sortOptions,
  selectedSort = '',
  onSortChange,
  extraControl,
  hasActiveFilters = false,
  onResetFilters,
}: FilterBarProps) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const theme = CATEGORY_THEMES[category];

  return (
    <div className="space-y-3">
      {/* Main Toolbar */}
      <div className="p-3 sm:p-4 rounded-[16px] bg-[#191C25] border border-[#343744] flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Status / Collection Tabs */}
        {tabs && tabs.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onTabChange?.(tab.id)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-[10px] text-[13px] font-semibold whitespace-nowrap shrink-0 border transition-colors duration-150 cursor-pointer ${
                    isActive
                      ? theme.activeTabClass
                      : 'bg-[#12141B] text-[#A2A4B1] hover:text-[#F2F0EC] border-[#343744] hover:border-[#454958]'
                  }`}
                >
                  <span>{tab.label}</span>
                  {typeof tab.count === 'number' && tab.count > 0 && (
                    <span className="px-1.5 py-0.2 rounded-[6px] bg-[#232633] text-[#F2F0EC] text-[11px] font-semibold">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Right Controls: Search + Genre + Sort + Reset */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full lg:w-auto">
          {onSearchSubmit && onSearchChange && (
            <form onSubmit={onSearchSubmit} className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-[#747887] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full h-10 pl-9 pr-16 rounded-[10px] bg-[#12141B] border border-[#343744] focus:border-[#F0A15B] text-[13px] text-[#F2F0EC] placeholder-[#747887] focus:outline-none transition-colors"
              />
              {searchValue && (
                <button
                  type="button"
                  aria-label="Hapus kata kunci"
                  onClick={() => onSearchChange('')}
                  className="absolute right-12 top-1/2 -translate-y-1/2 p-1 text-[#747887] hover:text-[#F2F0EC]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-[6px] bg-[#F0A15B] hover:bg-[#F6B779] text-[#0B0C10] text-xs font-semibold transition-colors"
              >
                Cari
              </button>
            </form>
          )}

          {/* Mobile Drawer Trigger */}
          {(genreOptions || sortOptions || extraControl) && (
            <button
              type="button"
              onClick={() => setMobileFiltersOpen((prev) => !prev)}
              aria-expanded={mobileFiltersOpen}
              className="sm:hidden inline-flex items-center justify-center gap-1.5 h-10 px-3 rounded-[10px] bg-[#12141B] border border-[#343744] text-xs font-semibold text-[#F2F0EC] shrink-0"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#F0A15B]" />
              <span>Filter</span>
            </button>
          )}

          {/* Desktop Genre & Sort Controls */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            {genreOptions && genreOptions.length > 0 && onGenreChange && (
              <select
                aria-label="Pilih Genre"
                value={selectedGenre}
                onChange={(e) => onGenreChange(e.target.value)}
                className="h-10 px-3 rounded-[10px] bg-[#12141B] border border-[#343744] hover:border-[#454958] focus:border-[#F0A15B] text-[13px] font-medium text-[#F2F0EC] focus:outline-none cursor-pointer max-w-[180px]"
              >
                <option value="">{genreLabel}</option>
                {genreOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}

            {sortOptions && sortOptions.length > 0 && onSortChange && (
              <select
                aria-label="Urutkan Konten"
                value={selectedSort}
                onChange={(e) => onSortChange(e.target.value)}
                className="h-10 px-3 rounded-[10px] bg-[#12141B] border border-[#343744] hover:border-[#454958] focus:border-[#F0A15B] text-[13px] font-medium text-[#F2F0EC] focus:outline-none cursor-pointer"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}

            {extraControl}

            {hasActiveFilters && onResetFilters && (
              <Button variant="ghost" size="md" onClick={onResetFilters} title="Reset Filter">
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Expandable Mobile Filter Drawer */}
      {mobileFiltersOpen && (genreOptions || sortOptions || extraControl) && (
        <div className="sm:hidden p-3.5 rounded-[16px] bg-[#191C25] border border-[#343744] space-y-3">
          {genreOptions && genreOptions.length > 0 && onGenreChange && (
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#A2A4B1] uppercase tracking-wider">
                Genre
              </label>
              <select
                value={selectedGenre}
                onChange={(e) => {
                  onGenreChange(e.target.value);
                  setMobileFiltersOpen(false);
                }}
                className="w-full h-10 px-3 rounded-[10px] bg-[#12141B] border border-[#343744] text-[13px] font-medium text-[#F2F0EC] focus:outline-none"
              >
                <option value="">{genreLabel}</option>
                {genreOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {sortOptions && sortOptions.length > 0 && onSortChange && (
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#A2A4B1] uppercase tracking-wider">
                Urutkan
              </label>
              <select
                value={selectedSort}
                onChange={(e) => {
                  onSortChange(e.target.value);
                  setMobileFiltersOpen(false);
                }}
                className="w-full h-10 px-3 rounded-[10px] bg-[#12141B] border border-[#343744] text-[13px] font-medium text-[#F2F0EC] focus:outline-none"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {extraControl}

          {hasActiveFilters && onResetFilters && (
            <Button
              variant="secondary"
              size="md"
              className="w-full"
              onClick={() => {
                onResetFilters();
                setMobileFiltersOpen(false);
              }}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Semua Filter</span>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
