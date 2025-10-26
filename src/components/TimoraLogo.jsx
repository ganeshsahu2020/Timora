import React from 'react';
import { HStack, useColorModeValue } from '@chakra-ui/react';

/**
 * TimoraLogo
 * modes:
 *  - "wordmark": gradient TIMORA with segmented O (default)
 *  - "icon": circular progress ring only (high-contrast, thicker strokes)
 *  - "legacy": original gradient tile + "Timora" (kept for compatibility)
 *
 * Props:
 *  - size: base scale; affects overall wordmark height and icon size
 *  - showWordmark: when mode="icon" or "legacy", optionally show text label
 *
 * This version adds:
 *  - animated gradient for the wordmark via SVG stop animation (SMIL)
 *  - subtle glass/blur elements and soft shadow for depth
 *  - responsive scaling tuned for Chakra size prop
 */
export default function TimoraLogo({
  mode = 'wordmark',
  size = 28,
  showWordmark = false,
}) {
  // Brand gradient endpoints
  const gradFrom = useColorModeValue('#A78BFA', '#D6BCFA'); // lighter in dark
  const gradTo   = useColorModeValue('#7C3AED', '#8B5CF6');

  // accessible text fill referencing the animated gradient
  const textFill = 'url(#timora-grad)';

  // ICON MODE
  if (mode === 'icon') {
    const px = Math.max(24, size);
    const strokeTrack = Math.max(6, Math.round(px * 0.14));
    const strokeArc   = Math.max(6, Math.round(px * 0.16));

    return (
      <svg width={px} height={px} viewBox="0 0 96 96" aria-label="Timora">
        <defs>
          <linearGradient id="timora-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={gradFrom}>
              <animate attributeName="stop-color" dur="6s" values={`${gradFrom};#60a5fa;#34d399;${gradFrom}`} repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor={gradTo}>
              <animate attributeName="stop-color" dur="6s" values={`${gradTo};#7C3AED;#A78BFA;${gradTo}`} repeatCount="indefinite" />
            </stop>
          </linearGradient>
        </defs>

        {/* translucent glass backing circle */}
        <circle cx="48" cy="48" r="42" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
        <g transform="translate(0,0)">
          {/* faint track */}
          <circle cx="48" cy="48" r="30" fill="none" stroke="rgba(124,58,237,0.12)" strokeWidth={strokeTrack} />
          {/* animated arc */}
          <g stroke={textFill} strokeWidth={strokeArc} strokeLinecap="round" fill="none">
            <path d="M48 16 A32 32 0 0 1 75 50" />
          </g>
        </g>
      </svg>
    );
  }

  // LEGACY MODE
  if (mode === 'legacy') {
    return (
      <HStack spacing={8}>
        <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
          <defs>
            <linearGradient id="timora-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={gradFrom}>
                <animate attributeName="stop-color" dur="5s" values={`${gradFrom};#60a5fa;#34d399;${gradFrom}`} repeatCount="indefinite" />
              </stop>
              <stop offset="100%" stopColor={gradTo}>
                <animate attributeName="stop-color" dur="5s" values={`${gradTo};#7C3AED;#A78BFA;${gradTo}`} repeatCount="indefinite" />
              </stop>
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
          <span
            style={{
              fontWeight: 800,
              letterSpacing: '.3px',
              color: useColorModeValue('#6D28D9', '#DDD6FE'),
            }}
          >
            Timora
          </span>
        )}
      </HStack>
    );
  }

  // WORDMARK (default)
  // The SVG is sized in an internal coordinate system for crisp scaling.
  const width = Math.round(size * 6);
  const height = Math.round(size * 2.6);

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
          <stop offset="0%" stopColor={gradFrom}>
            {/* subtle animated shift in the color stops to create a living brand mark */}
            <animate attributeName="stop-color" dur="6s" values={`${gradFrom};#60a5fa;#34d399;${gradFrom}`} repeatCount="indefinite" />
          </stop>
          <stop offset="100%" stopColor={gradTo}>
            <animate attributeName="stop-color" dur="6s" values={`${gradTo};#7C3AED;#A78BFA;${gradTo}`} repeatCount="indefinite" />
          </stop>
        </linearGradient>

        {/* a faint halo blur filter used for the wordmark to feel "glassy" */}
        <filter id="timora-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Left: TIM */}
      <g fill={textFill} transform="translate(60,0)">
        <text
          x="0"
          y="190"
          fontFamily="Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial"
          fontWeight="800"
          fontSize="160"
          letterSpacing="-4"
          style={{ paintOrder: 'stroke' }}
        >
          TIM
        </text>
      </g>

      {/* Segmented O (crisper at small sizes): faint base + one bold arc + two small ticks */}
      <g transform="translate(470,150)">
        {/* base ring */}
        <circle cx="0" cy="0" r="44" fill="none" stroke="rgba(124,58,237,0.18)" strokeWidth="12" />
        {/* main arc & segmentation */}
        <g stroke={textFill} strokeWidth="16" strokeLinecap="round" fill="none">
          <path d={`M0 -44 A44 44 0 0 1 34 4`} />
          <path d={`M22 -38 A44 44 0 0 1 28 -30`} />
          <path d={`M30 -26 A44 44 0 0 1 32 -20`} />
        </g>
        {/* a glossy highlight to emphasize glass */}
        <ellipse cx="-6" cy="-14" rx="26" ry="8" fill="rgba(255,255,255,0.07)" />
      </g>

      {/* Right: RA */}
      <g fill={textFill} transform="translate(560,0)">
        <text
          x="0"
          y="190"
          fontFamily="Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial"
          fontWeight="800"
          fontSize="160"
          letterSpacing="-6"
          style={{ filter: 'url(#timora-soft)' }}
        >
          RA
        </text>
      </g>
    </svg>
  );
}