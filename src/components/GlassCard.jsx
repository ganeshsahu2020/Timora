// src/components/GlassCard.jsx
import React, { forwardRef, useId } from 'react';
import {
  Box, Card, CardHeader, CardBody, Heading, HStack, useColorModeValue,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';

let MotionCard;

// Use motion.create if available to avoid deprecation warnings; fallback to motion(Card)
if (motion && typeof motion.create === 'function') {
  MotionCard = motion.create(Card);
} else if (typeof motion === 'function') {
  // older framer-motion where motion is callable
  MotionCard = motion(Card);
} else {
  // as a safe fallback (shouldn't typically be needed)
  MotionCard = Card;
}

const GlassCard = forwardRef(({ 
  children, 
  title, 
  right, 
  colSpan = 1, 
  as = 'section', 
  ...rest 
}, ref) => {
  const id = useId();
  const headerId = title ? `glasscard-${id}-title` : undefined;
  const border = useColorModeValue('blackAlpha.200', 'whiteAlpha.300');
  const bg = useColorModeValue('rgba(255,255,255,0.75)', 'rgba(17,24,39,0.45)');

  return (
    <Box
      gridColumn={`span ${colSpan}`}
      style={{ 
        gridColumn: colSpan ? `span ${colSpan}` : undefined 
      }}
    >
      <MotionCard
        as={as}
        ref={ref}
        role="region"
        aria-labelledby={headerId}
        tabIndex={0}
        bg={bg}
        backdropFilter="blur(12px)"
        border="1px solid"
        borderColor={border}
        boxShadow="lux"
        borderRadius="2xl"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
        whileHover={{ y: -6, boxShadow: '0 20px 60px rgba(99,102,241,0.12)' }}
        whileFocus={{ y: -6 }}
        _focusWithin={{ ring: 3, ringColor: 'brand.400', ringOffset: 2 }}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && e.currentTarget) {
            const el = e.currentTarget.querySelector('button, a, [role="button"], input, select, textarea');
            if (el) el.focus();
          }
        }}
        {...rest}
      >
        {title && (
          <CardHeader pb={3}>
            <HStack justify="space-between" align="center">
              <Heading size="sm" id={headerId}>{title}</Heading>
              <Box>{right}</Box>
            </HStack>
          </CardHeader>
        )}
        <CardBody pt={title ? 0 : 4}>{children}</CardBody>
      </MotionCard>
    </Box>
  );
});

GlassCard.displayName = 'GlassCard';

export default GlassCard;
