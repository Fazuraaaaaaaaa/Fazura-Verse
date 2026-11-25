import React from 'react';
import { CATEGORY_THEMES, type MediaCategory } from '../../utils/categoryTheme';

export type BadgeVariant = 'status' | 'category' | 'metadata' | 'brand';

interface BadgeProps {
  variant?: BadgeVariant;
  category?: MediaCategory;
  className?: string;
  children: React.ReactNode;
}

export function Badge({
  variant = 'metadata',
  category,
  className = '',
  children,
}: BadgeProps) {
  let variantClass =
    'bg-[#232633] text-[#A2A4B1] border-[#343744]';

  if (variant === 'brand') {
    variantClass = 'bg-[#F0A15B]/15 text-[#F0A15B] border-[#F0A15B]/35';
  } else if (variant === 'category' && category) {
    variantClass = CATEGORY_THEMES[category].badgeClass;
  } else if (variant === 'status') {
    variantClass = 'bg-[#191C25]/90 text-[#F2F0EC] border-[#343744]';
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] border text-[11px] font-semibold tracking-wide whitespace-nowrap ${variantClass} ${className}`}
    >
      {children}
    </span>
  );
}
