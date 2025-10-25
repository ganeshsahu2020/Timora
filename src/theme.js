// src/theme.js
import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    brand: {
      50:  '#f5f3ff',
      100: '#ede9fe',
      200: '#ddd6fe',
      300: '#c4b5fd',
      400: '#a78bfa',
      500: '#8b5cf6',
      600: '#7c3aed',
      700: '#6d28d9',
      800: '#5b21b6',
      900: '#4c1d9b', // small tweak for better contrast in dark UIs
    },
  },
  shadows: {
    lux: '0 8px 30px rgba(2,6,23,0.08), 0 2px 8px rgba(99,102,241,0.06)',
  },
  styles: {
    global: {
      '*, *::before, *::after': {
        boxSizing: 'border-box',
      },
      body: {
        bg: 'gray.50',
        color: 'gray.800',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      },
      ':focus': {
        outline: 'none',
      },
      'button, [role="button"], a': {
        '&:focus': {
          boxShadow: '0 0 0 3px rgba(139,92,246,0.18)',
        },
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        _focus: { boxShadow: '0 0 0 4px rgba(99,102,241,0.14)' },
      },
    },
  },
});

export default theme;
