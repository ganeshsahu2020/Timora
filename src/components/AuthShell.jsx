// src/components/AuthShell.jsx
import React from 'react';
import { Box, Container, VStack, Heading, Text } from '@chakra-ui/react';

export default function AuthShell({ title, subtitle, children }) {
  return (
    <Box as="main" role="main" py={{ base: 8, md: 14 }}>
      <Container maxW="lg">
        <VStack spacing={6} align="stretch">
          {title && <Heading as="h1" size="lg">{title}</Heading>}
          {subtitle && <Text color="gray.500">{subtitle}</Text>}
          {children}
        </VStack>
      </Container>
    </Box>
  );
}
