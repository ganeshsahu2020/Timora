import React from 'react';
import { Box, Container } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function AppLayout({ children }) {
  // Support both direct children and nested routing via Outlet
  const content = children ?? <Outlet />;

  return (
    <>
      <Box as="header">
        <Navbar />
      </Box>

      <Box as="main" id="main-content">
        <Container maxW="6xl" py={{ base: 6, md: 8 }}>
          {content}
        </Container>
      </Box>

      <Box as="footer" borderTopWidth="1px" py={6}>
        <Container maxW="6xl" fontSize="sm" color="gray.500">
          © {new Date().getFullYear()} Timora
        </Container>
      </Box>
    </>
  );
}
