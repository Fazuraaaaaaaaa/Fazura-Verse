export type MediaCategory = 'anime' | 'movies' | 'manga' | 'donghua' | 'music';

export interface CategoryThemeConfig {
  id: MediaCategory;
  label: string;
  accentHex: string;
  textClass: string;
  badgeClass: string;
  activeTabClass: string;
  borderFocusClass: string;
  hoverTextClass: string;
  ringClass: string;
}

export const CATEGORY_THEMES: Record<MediaCategory, CategoryThemeConfig> = {
  anime: {
    id: 'anime',
    label: 'Anime',
    accentHex: '#A78BFA',
    textClass: 'text-[#A78BFA]',
    badgeClass: 'bg-[#A78BFA]/15 text-[#A78BFA] border-[#A78BFA]/30',
    activeTabClass: 'bg-[#A78BFA]/15 text-[#A78BFA] border-[#A78BFA]/45',
    borderFocusClass: 'focus:border-[#A78BFA]',
    hoverTextClass: 'hover:text-[#A78BFA]',
    ringClass: 'border-[#A78BFA]/40',
  },
  movies: {
    id: 'movies',
    label: 'Movies',
    accentHex: '#F0A15B',
    textClass: 'text-[#F0A15B]',
    badgeClass: 'bg-[#F0A15B]/15 text-[#F0A15B] border-[#F0A15B]/30',
    activeTabClass: 'bg-[#F0A15B]/15 text-[#F0A15B] border-[#F0A15B]/45',
    borderFocusClass: 'focus:border-[#F0A15B]',
    hoverTextClass: 'hover:text-[#F0A15B]',
    ringClass: 'border-[#F0A15B]/40',
  },
  manga: {
    id: 'manga',
    label: 'Manga',
    accentHex: '#75C9A0',
    textClass: 'text-[#75C9A0]',
    badgeClass: 'bg-[#75C9A0]/15 text-[#75C9A0] border-[#75C9A0]/30',
    activeTabClass: 'bg-[#75C9A0]/15 text-[#75C9A0] border-[#75C9A0]/45',
    borderFocusClass: 'focus:border-[#75C9A0]',
    hoverTextClass: 'hover:text-[#75C9A0]',
    ringClass: 'border-[#75C9A0]/40',
  },
  donghua: {
    id: 'donghua',
    label: 'Donghua',
    accentHex: '#67BFD5',
    textClass: 'text-[#67BFD5]',
    badgeClass: 'bg-[#67BFD5]/15 text-[#67BFD5] border-[#67BFD5]/30',
    activeTabClass: 'bg-[#67BFD5]/15 text-[#67BFD5] border-[#67BFD5]/45',
    borderFocusClass: 'focus:border-[#67BFD5]',
    hoverTextClass: 'hover:text-[#67BFD5]',
    ringClass: 'border-[#67BFD5]/40',
  },
  music: {
    id: 'music',
    label: 'Music',
    accentHex: '#E68BA6',
    textClass: 'text-[#E68BA6]',
    badgeClass: 'bg-[#E68BA6]/15 text-[#E68BA6] border-[#E68BA6]/30',
    activeTabClass: 'bg-[#E68BA6]/15 text-[#E68BA6] border-[#E68BA6]/45',
    borderFocusClass: 'focus:border-[#E68BA6]',
    hoverTextClass: 'hover:text-[#E68BA6]',
    ringClass: 'border-[#E68BA6]/40',
  },
};

export function createPosterFallbackSvg(label = 'FAZURASTREAM', accentHex = '#F0A15B'): string {
  const safeLabel = label.replace(/[<>&"]/g, '');
  return (
    'data:image/svg+xml;charset=UTF-8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450">
        <defs>
          <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#191C25"/>
            <stop offset="60%" stop-color="#12141B"/>
            <stop offset="100%" stop-color="#0B0C10"/>
          </linearGradient>
          <radialGradient id="glow" cx="50%" cy="40%" r="55%">
            <stop offset="0%" stop-color="${accentHex}" stop-opacity="0.3"/>
            <stop offset="60%" stop-color="${accentHex}" stop-opacity="0.05"/>
            <stop offset="100%" stop-color="#0B0C10" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <rect width="300" height="450" fill="url(#bg)"/>
        <rect width="300" height="450" fill="url(#glow)"/>
        <rect x="14" y="14" width="272" height="422" rx="10" fill="none" stroke="#232633" stroke-width="1.5"/>
        <circle cx="150" cy="180" r="34" fill="${accentHex}" opacity="0.18"/>
        <path d="M142 166 L164 180 L142 194 Z" fill="${accentHex}"/>
        <text x="150" y="240" font-family="'Outfit', 'Inter', -apple-system, sans-serif" font-size="12" font-weight="700" letter-spacing="2" fill="#F2F0EC" text-anchor="middle">${safeLabel}</text>
        <rect x="110" y="258" width="80" height="2" rx="1" fill="${accentHex}" opacity="0.6"/>
        <text x="150" y="410" font-family="'Outfit', 'Inter', -apple-system, sans-serif" font-size="9" font-weight="600" letter-spacing="3" fill="#747887" text-anchor="middle">FAZURASTREAM</text>
      </svg>`
    )
  );
}
