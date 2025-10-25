// src/pages/RecoveryAdmin.jsx
import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Stack,
  Divider,
  SimpleGrid,
} from '@chakra-ui/react';

import RecoverySnapshotCard from '../components/recovery/RecoverySnapshotCard';
import LogsTable from '../components/recovery/LogsTable';
import TriggersEditor from '../components/recovery/TriggersEditor';
import RelapsesEditor from '../components/recovery/RelapsesEditor';
import SupportsEditor from '../components/recovery/SupportsEditor';

export default function RecoveryAdmin() {
  return (
    <Container maxW="6xl" py={8}>
      <Stack spacing={8}>
        {/* Page header */}
        <Box>
          <Heading size="lg">Recovery Admin</Heading>
          <Text color="gray.500" mt={1}>
            Manage your snapshot and logs, and fully customize triggers, relapse notes, and supports.
          </Text>
        </Box>

        {/* Snapshot */}
        <RecoverySnapshotCard />

        <Divider />

        {/* Logs */}
        <Box>
          <Heading size="md" mb={4}>Logs</Heading>
          <LogsTable />
        </Box>

        <Divider />

        {/* Editors: Triggers / Relapses / Supports */}
        <Box>
          <Heading size="md" mb={4}>Customize</Heading>
          <Text color="gray.500" mb={4}>
            Add, edit, or delete your triggers, relapse notes, and support contacts. Changes save to Supabase with RLS per-user.
          </Text>
          <SimpleGrid columns={{ base: 1, md: 1 }} spacing={10}>
            <TriggersEditor />
            <RelapsesEditor />
            <SupportsEditor />
          </SimpleGrid>
        </Box>
      </Stack>
    </Container>
  );
}
