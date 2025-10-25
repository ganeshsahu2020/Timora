// src/components/AnimatedIcons.jsx
import React from 'react';
import { Box } from '@chakra-ui/react';

// Small set of reusable animated-gradient SVG icons.
// Each accepts size (px) and title for accessibility.

export function IconModeToggle({ size = 18, title = 'Toggle color mode' }) {
  return (
    <Box as="span" aria-hidden={false} role="img" aria-label={title} display="inline-block" lineHeight="0">
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" focusable="false">
        <defs>
          <linearGradient id="modeGrad" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6">
              <animate attributeName="stop-color" dur="6s" repeatCount="indefinite" values="#8b5cf6;#06b6d4;#a78bfa;#8b5cf6" />
            </stop>
            <stop offset="100%" stopColor="#06b6d4">
              <animate attributeName="stop-color" dur="6s" repeatCount="indefinite" values="#06b6d4;#a78bfa;#8b5cf6;#06b6d4" />
            </stop>
          </linearGradient>
        </defs>

        <circle cx="12" cy="12" r="9" fill="url(#modeGrad)" opacity="0.95" />
        <path d="M12 7a5 5 0 100 10 5 5 0 000-10z" fill="rgba(255,255,255,0.9)" opacity="0.95" />
      </svg>
    </Box>
  );
}

export function IconRefresh({ size = 18, title = 'Refresh' }) {
  return (
    <Box as="span" aria-hidden={false} role="img" aria-label={title} display="inline-block" lineHeight="0">
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" focusable="false">
        <defs>
          <linearGradient id="refreshGrad" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        <path d="M21 12a9 9 0 10-2.6 6.02L21 19" stroke="url(#refreshGrad)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M21 3v6h-6" stroke="url(#refreshGrad)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Box>
  );
}

export function IconCalendar({ size = 18, title = 'Calendar' }) {
  return (
    <Box as="span" aria-hidden={false} role="img" aria-label={title} display="inline-block" lineHeight="0">
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" focusable="false">
        <defs>
          <linearGradient id="calGrad" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
        <rect x="3" y="5" width="18" height="16" rx="3" stroke="url(#calGrad)" strokeWidth="1.6" />
        <path d="M16 3v4M8 3v4" stroke="url(#calGrad)" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </Box>
  );
}

export function IconSearch({ size = 18, title = 'Search' }) {
  return (
    <Box as="span" aria-hidden={false} role="img" aria-label={title} display="inline-block" lineHeight="0">
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" focusable="false">
        <defs>
          <linearGradient id="searchGrad" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        <circle cx="11" cy="11" r="4.5" stroke="url(#searchGrad)" strokeWidth="1.6" />
        <path d="M21 21l-4.35-4.35" stroke="url(#searchGrad)" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </Box>
  );
}