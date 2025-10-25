import React from 'react';
import { HStack, useColorModeValue } from '@chakra-ui/react';

/**
 * TimoraLogo
 * modes:
 *  - "wordmark": gradient TIMORA with segmented O (default)
 *  - "icon": round segmented progress icon only
 *  - "legacy": your original purple gradient badge + "Timora" (kept for compatibility)
 */
export default function TimoraLogo({
  mode = 'wordmark',
  size = 28,
  showWordmark = false, // only used by "icon" and "legacy"
}) {
  const gradFrom = useColorModeValue('#A78BFA', '#A78BFA'); // brand.400
  const gradTo   = useColorModeValue('#7C3AED', '#7C3AED'); // brand.600
  const textFill = `url(#timora-grad)`;
  const muted    = useColorModeValue('#a78bfa44', '#a78bfa55'); // muted remainder segments

  if (mode === 'icon') {
    const px = size;
    return (
      <svg width={px} height={px} viewBox="0 0 96 96" aria-label="Timora icon">
        <defs>
          <linearGradient id="timora-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={gradFrom} />
            <stop offset="100%" stopColor={gradTo} />
          </linearGradient>
        </defs>
        <circle cx="48" cy="48" r="34" fill="none" stroke={muted} strokeWidth="10" />
        {/* three filled progress segments (clockwise from top) */}
        <g stroke={textFill} strokeWidth="10" strokeLinecap="round" fill="none">
          <path d="M48 14 A34 34 0 0 1 67 20" />
          <path d="M70 22 A34 34 0 0 1 78 34" />
          <path d="M79 38 A34 34 0 0 1 74 58" />
        </g>
      </svg>
    );
  }

  if (mode === 'legacy') {
    // your original gradient tile + text
    return (
      <HStack spacing={8}>
        <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
          <defs>
            <linearGradient id="timora-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={gradFrom} />
              <stop offset="100%" stopColor={gradTo} />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="64" height="64" rx="14" fill="url(#timora-grad)" />
          <g fill="#fff" transform="translate(16,14)">
            <rect x="14" y="5" width="8" height="30" rx="4" />
            <rect x="0" y="5" width="36" height="8" rx="4" />
            <rect x="18" y="14" width="8" height="22" rx="4" transform="rotate(45 22 25)" opacity="0.9" />
          </g>
        </svg>
        {showWordmark && (
          <span style={{ fontWeight: 800, letterSpacing: '.3px', color: useColorModeValue('#6D28D9', '#DDD6FE') }}>
            Timora
          </span>
        )}
      </HStack>
    );
  }

  // WORDMARK (default): “TIMORA” with segmented “O”
  const width = size * 6;     // scales nicely with Navbar font
  const height = size * 2.6;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 1200 300"
      role="img"
      aria-label="Timora — Small Habits, Big Momentum"
    >
      <defs>
        <linearGradient id="timora-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={gradFrom} />
          <stop offset="100%" stopColor={gradTo} />
        </linearGradient>
      </defs>

      {/* Left: TIM */}
      <g fill={textFill} transform="translate(60,0)">
        <text x="0" y="190"
              fontFamily="Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial"
              fontWeight="800" fontSize="160" letterSpacing="-4">
          TIM
        </text>
      </g>

      {/* Segmented O (progress) */}
      <g transform="translate(470,150)">
        {/* faint base ring */}
        <circle cx="0" cy="0" r="44" fill="none" stroke={muted} strokeWidth="10" />
        {/* three filled brand-gradient segments */}
        <g stroke={textFill} strokeWidth="10" strokeLinecap="round" fill="none">
          <path d="M0 -44 A44 44 0 0 1 22 -38" />
          <path d="M26 -36 A44 44 0 0 1 36 -22" />
          <path d="M38 -18 A44 44 0 0 1 34 4" />
        </g>
      </g>

      {/* Right: RA */}
      <g fill={textFill} transform="translate(560,0)">
        <text x="0" y="190"
              fontFamily="Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial"
              fontWeight="800" fontSize="160" letterSpacing="-6">
          RA
        </text>
      </g>
    </svg>
  );
}
