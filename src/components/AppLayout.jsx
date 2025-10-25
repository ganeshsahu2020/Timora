// src/components/AppLayout.jsx
import React from 'react';
import { Box } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function AppLayout() {
  return (
    <>
      <Box as="header" role="banner">
        <Navbar />
      </Box>

      {/* Single page-wide landmark */}
      <Box as="main" role="main" minH="60vh" px={{ base: 4, md: 8 }} py={{ base: 6, md: 8 }}>
        <Outlet />
      </Box>

      <Box as="footer" role="contentinfo" py={8} textAlign="center" opacity={0.8}>
        © {new Date().getFullYear()} Timora
      </Box>
    </>
  );
}
