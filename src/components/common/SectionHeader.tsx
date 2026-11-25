import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { CATEGORY_THEMES, type MediaCategory } from '../../utils/categoryTheme';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  category?: MediaCategory;
  viewAllTo?: string;
  viewAllLabel?: string;
  rightSlot?: React.ReactNode;
  className?: string;
}

export function SectionHeader({
  title,
  subtitle,
  category,
  viewAllTo,
  viewAllLabel = 'Lihat Semua',
  rightSlot,
  className = '',
}: SectionHeaderProps) {
  const accentBarHex = category ? CATEGORY_THEMES[category].accentHex : '#F0A15B';

  return (
    <div className={`flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-3 border-b border-[#2D303E] ${className}`}>
      <div className="space-y-1 min-w-0">
        <div className="flex items-center gap-2.5">
          <span
            className="w-1.5 h-5 rounded-full shrink-0"
            style={{
              backgroundColor: accentBarHex,
              boxShadow: `0 0 12px ${accentBarHex}99`,
            }}
            aria-hidden="true"
          />
          <h2 className="font-heading text-xl sm:text-2xl font-semibold text-[#F2F0EC] tracking-tight leading-tight truncate">
            {title}
          </h2>
        </div>
        {subtitle && (
          <p className="text-[13px] text-[#A2A4B1] pl-4 line-clamp-1">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3 shrink-0 self-start sm:self-end pl-3.5 sm:pl-0">
        {rightSlot}
        {viewAllTo && (
          <Link
            to={viewAllTo}
            className="inline-flex items-center gap-1 text-xs sm:text-[13px] font-semibold text-[#A2A4B1] hover:text-[#F0A15B] transition-colors whitespace-nowrap"
          >
            <span>{viewAllLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
}
