// src/components/recovery/LogsTable.jsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  Box, Card, CardHeader, CardBody, Heading, Table, Thead, Tbody, Tr, Th, Td,
  HStack, Select, Button, useToast, IconButton, Tooltip, Text, Spinner
} from '@chakra-ui/react';
import { RepeatIcon } from '@chakra-ui/icons';
import { listRecoveryLogs } from '../../services/recoveryStore';

const TYPES = [
  'all',
  'sober-day',
  'craving',
  'intake',
  'exposure',
  'medication',
  'therapy',
  'note'
];

export default function LogsTable({ initialLimit = 50 }) {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('all');

  const load = async () => {
    try {
      setLoading(true);
      const rows = await listRecoveryLogs({ limit: initialLimit });
      setLogs(rows || []);
    } catch (e) {
      toast({ title: 'Failed to load logs', status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (filter === 'all') return logs;
    return logs.filter((r) => r.type === filter);
  }, [logs, filter]);

  return (
    <Card>
      <CardHeader display="flex" alignItems="center" justifyContent="space-between">
        <Heading size="md">Recent Activity</Heading>
        <HStack>
          <Select size="sm" value={filter} onChange={(e) => setFilter(e.target.value)}>
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </Select>
          <Tooltip label="Refresh">
            <IconButton
              aria-label="Refresh"
              icon={<RepeatIcon />}
              size="sm"
              variant="ghost"
              onClick={load}
            />
          </Tooltip>
        </HStack>
      </CardHeader>
      <CardBody>
        {loading ? (
          <HStack><Spinner /><Text>Loading logs…</Text></HStack>
        ) : (
          <Box overflowX="auto">
            <Table size="sm" variant="simple">
              <Thead>
                <Tr>
                  <Th minW="170px">Date</Th>
                  <Th minW="120px">Type</Th>
                  <Th minW="120px">Trigger</Th>
                  <Th isNumeric>Craving</Th>
                  <Th minW="120px">Amount</Th>
                  <Th>Notes</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filtered.length === 0 ? (
                  <Tr><Td colSpan={6}><Text color="gray.500">No logs yet.</Text></Td></Tr>
                ) : filtered.map((row) => (
                  <Tr key={row.id}>
                    <Td>{new Date(row.date).toLocaleString()}</Td>
                    <Td>{row.type}</Td>
                    <Td>{row.trigger || '—'}</Td>
                    <Td isNumeric>{row.craving_level ?? '—'}</Td>
                    <Td>{row.amount || '—'}</Td>
                    <Td>{row.notes || '—'}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}
      </CardBody>
    </Card>
  );
}
