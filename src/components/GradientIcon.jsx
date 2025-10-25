// src/components/GradientIcon.jsx
import React from 'react';
import { Box } from '@chakra-ui/react';

/**
 * Usage:
 *   <GradientIcon as={LogIn} aria-label="Login" size={22}/>
 */
export default function GradientIcon({ as: Icon, size = 20, ...props }) {
  return (
    <Box
      as="span"
      aria-hidden={props['aria-label'] ? undefined : true}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        w: `${size}px`,
        h: `${size}px`,
        mask: 'linear-gradient(black, black)',
        WebkitMaskImage: 'linear-gradient(black, black)',
        background: 'linear-gradient(135deg, #A78BFA, #7C3AED, #34D399)',
        backgroundSize: '200% 200%',
        borderRadius: 'md',
        transition: 'transform .25s ease, filter .25s ease, background-position .8s ease',
        _hover: { transform: 'translateY(-1px)', filter: 'brightness(1.05)', backgroundPosition: '100% 0%' },
        _focusWithin: { outline: '2px solid', outlineColor: 'purple.400' },
        '& svg': { color: 'transparent', stroke: 'currentColor' },
      }}
      {...props}
    >
      {Icon ? <Icon size={size} /> : null}
    </Box>
  );
}
