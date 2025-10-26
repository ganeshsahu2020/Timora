// src/components/AppLayout.jsx
import React from 'react';
import { Box } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function AppLayout() {
  return (
    <>
      <Box as="header" role="banner" position="static">
        <Navbar />
      </Box>

      {/* Let the document (window) own the scroll. No fixed heights/overflow here. */}
      <Box as="main" role="main" px={{ base: 4, md: 8 }} py={{ base: 6, md: 8 }}>
        <Outlet />
      </Box>

      <Box as="footer" role="contentinfo" py={8} textAlign="center" opacity={0.8}>
        © {new Date().getFullYear()} Timora
      </Box>
    </>
  );
}
