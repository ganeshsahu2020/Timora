// src/components/AnimatedLogo.jsx
import { Box } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import './logo.css'; // small file-less import so bundlers include the css if needed

// An animated, accessible SVG logo with animated gradient
export default function AnimatedLogo({ size = 40 }) {
  return (
    <Box
      as={motion.div}
      initial={{ scale: 1 }}
      whileHover={{ scale: 1.06, rotate: 3 }}
      whileFocus={{ scale: 1.03 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      display="inline-block"
      boxSize={`${size}px`}
      aria-hidden={false}
      role="img"
      aria-label="AI Time Shifter logo"
    >
      <svg viewBox="0 0 48 48" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="g1" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6"><animate attributeName="stop-color" dur="6s" repeatCount="indefinite" values="#8b5cf6;#06b6d4;#a78bfa;#8b5cf6" /></stop>
            <stop offset="100%" stopColor="#06b6d4"><animate attributeName="stop-color" dur="6s" repeatCount="indefinite" values="#06b6d4;#a78bfa;#8b5cf6;#06b6d4" /></stop>
          </linearGradient>
          <filter id="glass">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feBlend in="SourceGraphic" in2="b" mode="normal" />
          </filter>
        </defs>

        <rect x="2" y="2" width="44" height="44" rx="10" fill="url(#g1)" opacity="0.95" filter="url(#glass)" />
        <g transform="translate(8,8)">
          <path d="M8 0 C13 0 16 3 16 8 C16 13 13 16 8 16 C3 16 0 13 0 8 C0 3 3 0 8 0 Z" fill="rgba(255,255,255,0.12)" />
          <path d="M11 4 L5 12" stroke="white" strokeOpacity="0.9" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </Box>
  );
}