// src/components/recovery/RecoverySnapshotCard.jsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  Box, Card, CardHeader, CardBody, Heading, Text, HStack, VStack,
  Stat, StatLabel, StatNumber, StatHelpText, Button, Input, Select,
  useToast, Divider, IconButton, Tooltip, Spinner
} from '@chakra-ui/react';
import { RepeatIcon } from '@chakra-ui/icons';
import {
  getRecoverySnapshot,
  updateRecoverySnapshot,
  saveRecoveryEntry
} from '../../services/recoveryStore';

const STAGES = [
  'precontemplation',
  'contemplation',
  'preparation',
  'action',
  'maintenance',
  'early-recovery'
];

export default function RecoverySnapshotCard() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snapshot, setSnapshot] = useState(null);

  const daysSober = snapshot?.pattern?.daysSober ?? 0;
  const stage = snapshot?.pattern?.stage ?? 'action';
  const last7dAvg = snapshot?.cravings?.last7dAvg ?? 0;
  const substance = snapshot?.substance ?? '';

  const load = async () => {
    try {
      setLoading(true);
      const s = await getRecoverySnapshot();
      setSnapshot(s);
    } catch (e) {
      toast({ title: 'Failed to load snapshot', status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const [edit, setEdit] = useState({ stage, substance });

  useEffect(() => {
    // keep local edit state in sync when snapshot changes
    setEdit({ stage, substance });
  }, [stage, substance]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateRecoverySnapshot({
        substance: edit.substance,
        pattern: { stage: edit.stage }
      });
      toast({ title: 'Snapshot updated', status: 'success' });
      await load();
    } catch (e) {
      toast({ title: 'Update failed', status: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const quickSober = async () => {
    try {
      await saveRecoveryEntry({ type: 'sober-day' });
      toast({ title: 'Sober day logged', status: 'success' });
      await load();
    } catch {
      toast({ title: 'Could not log sober day', status: 'error' });
    }
  };

  const [craving, setCraving] = useState(3);
  const quickCraving = async () => {
    const lvl = Number(craving);
    if (Number.isNaN(lvl) || lvl < 0 || lvl > 10) {
      toast({ title: 'Craving must be 0–10', status: 'warning' });
      return;
    }
    try {
      await saveRecoveryEntry({ type: 'craving', cravingLevel: lvl });
      toast({ title: 'Craving logged', status: 'success' });
      await load();
    } catch {
      toast({ title: 'Could not log craving', status: 'error' });
    }
  };

  const scoreHint = useMemo(() => {
    // lightweight local hint; real score comes from insights API if you use it
    const base = 100 - (last7dAvg * 10) + daysSober / 2;
    return Math.max(0, Math.min(100, Math.round(base)));
  }, [daysSober, last7dAvg]);

  if (loading) {
    return (
      <Card>
        <CardBody>
          <HStack>
            <Spinner />
            <Text>Loading recovery snapshot…</Text>
          </HStack>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader display="flex" alignItems="center" justifyContent="space-between">
        <Heading size="md">Recovery Snapshot</Heading>
        <Tooltip label="Refresh">
          <IconButton
            aria-label="Refresh"
            icon={<RepeatIcon />}
            size="sm"
            variant="ghost"
            onClick={load}
          />
        </Tooltip>
      </CardHeader>
      <CardBody>
        <HStack spacing={6} align="stretch">
          <Stat>
            <StatLabel>Days Sober</StatLabel>
            <StatNumber>{daysSober}</StatNumber>
            <StatHelpText>Keep going!</StatHelpText>
          </Stat>

          <Stat>
            <StatLabel>Avg Cravings (7d)</StatLabel>
            <StatNumber>{last7dAvg}</StatNumber>
            <StatHelpText>0–10 scale</StatHelpText>
          </Stat>

          <Stat>
            <StatLabel>Readiness Score (hint)</StatLabel>
            <StatNumber>{scoreHint}</StatNumber>
            <StatHelpText>Higher is better</StatHelpText>
          </Stat>
        </HStack>

        <Divider my={5} />

        <VStack align="stretch" spacing={3}>
          <HStack>
            <Box flex="1">
              <Text mb={1} fontWeight="semibold">Stage</Text>
              <Select
                value={edit.stage}
                onChange={(e) => setEdit((s) => ({ ...s, stage: e.target.value }))}
              >
                {STAGES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Select>
            </Box>
            <Box flex="1">
              <Text mb={1} fontWeight="semibold">Primary Substance</Text>
              <Input
                placeholder="alcohol / nicotine / …"
                value={edit.substance}
                onChange={(e) => setEdit((s) => ({ ...s, substance: e.target.value }))}
              />
            </Box>
          </HStack>

          <HStack>
            <Button onClick={handleSave} isLoading={saving} colorScheme="blue">
              Save Snapshot
            </Button>
            <Button onClick={quickSober} variant="outline">Log Sober Day</Button>
          </HStack>
        </VStack>

        <Divider my={5} />

        <Heading size="sm" mb={2}>Quick Log: Craving</Heading>
        <HStack>
          <Input
            type="number"
            min={0}
            max={10}
            step={1}
            w="120px"
            value={craving}
            onChange={(e) => setCraving(e.target.value)}
          />
          <Button onClick={quickCraving}>Add Craving</Button>
        </HStack>
      </CardBody>
    </Card>
  );
}
