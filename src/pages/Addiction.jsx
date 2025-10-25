// src/pages/Addiction.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Box, Heading, Text, SimpleGrid, HStack, Badge, useColorModeValue, Button, VStack,
  Progress, Wrap, WrapItem, Collapse, useToast, Card, CardBody, Stat, StatLabel, StatNumber,
  StatHelpText, Divider, IconButton, Tooltip, Table, Thead, Tbody, Tr, Th, Td,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, ModalFooter,
  FormControl, FormLabel, Input, Select, NumberInput, NumberInputField, Textarea, Switch,
  Tag, TagLabel, TagRightIcon, useDisclosure, Checkbox, CheckboxGroup, Stack
} from "@chakra-ui/react";
import { DownloadIcon, AddIcon, InfoOutlineIcon } from "@chakra-ui/icons";
import { FaRobot, FaHeartbeat, FaPlay, FaStop } from "react-icons/fa";
import { Link as RouterLink } from "react-router-dom";
import GlassCard from "../components/GlassCard";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip as RTooltip, CartesianGrid,
  BarChart, Bar
} from "recharts";

import {
  getRecoverySnapshot,
  generateRecoveryInsights,
  exportRecoveryData,
  saveRecoveryEntry,
} from "../services/recoveryStore";

export default function Addiction() {
  const [snapshot, setSnapshot] = useState(null);
  const [insights, setInsights] = useState(null);
  const [showExport, setShowExport] = useState(false);
  const [logs, setLogs] = useState([]);
  const [plan, setPlan] = useState(() => {
    // local starter checklist (customizable per user later)
    const cached = localStorage.getItem("recovery:dailyPlan");
    return cached ? JSON.parse(cached) : [
      { id: "water", label: "Hydrate on wake (300–500ml)", done: false },
      { id: "reachout", label: "Text a support buddy", done: false },
      { id: "move", label: "10–15 min walk or light exercise", done: false },
      { id: "urgeSurf", label: "1 urge-surfing rep (3 min)", done: false },
      { id: "reflect", label: "2-minute reflection/journal", done: false },
    ];
  });
  const [urgeTimer, setUrgeTimer] = useState({ running: false, secs: 180 });

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const heroFrom = useColorModeValue("brand.500", "brand.600");
  const heroTo = useColorModeValue("brand.700", "brand.700");
  const subText = useColorModeValue("gray.700", "gray.300");
  const chipBg = useColorModeValue("blackAlpha.50", "whiteAlpha.100");
  const chipBr = useColorModeValue("blackAlpha.200", "whiteAlpha.300");
  const tableBorder = useColorModeValue("blackAlpha.200", "whiteAlpha.200");

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAll = async () => {
    const s = await getRecoverySnapshot();
    const i = await generateRecoveryInsights();
    setSnapshot(s || {});
    setInsights(i || {});
    // pull any recent log summary from snapshot if present
    const recent = s?.logs?.recent || [];
    setLogs(Array.isArray(recent) ? recent : []);
  };

  const onExport = async (fmt) => {
    try {
      await exportRecoveryData(fmt);
      toast({ title: `Exported ${fmt.toUpperCase()}`, status: "success" });
      setShowExport(false);
    } catch {
      toast({ title: "Export failed", status: "error" });
    }
  };

  const daysSober = snapshot?.pattern?.daysSober || 0;
  const cravingAvg = snapshot?.cravings?.last7dAvg ?? 0;
  const stage = snapshot?.pattern?.stage || "action";

  // charts (placeholder/simple demo)
  const cravingSeries = useMemo(
    () =>
      Array.from({ length: 8 }).map((_, i) => ({
        day: `D-${7 - i}`,
        value: Math.max(0, Math.round((cravingAvg + (Math.random() - 0.5)) * 10) / 10),
      })),
    [cravingAvg]
  );
  const weeklyExposure = useMemo(
    () => [
      { label: "Social", value: Math.max(0, Math.round((Math.random() * 5))) },
      { label: "Stress", value: Math.max(0, Math.round((Math.random() * 5))) },
      { label: "Evenings", value: Math.max(0, Math.round((Math.random() * 5))) },
    ],
    []
  );

  // ----- Add Log Modal State -------------------------------------------------
  const [entry, setEntry] = useState({
    date: new Date().toISOString().slice(0, 16), // local datetime-local control
    type: "craving", // craving | intake | exposure | medication | therapy | note
    substance: "",
    amount: "",
    cravingLevel: 5,
    trigger: "",
    urgeDurationMin: "",
    usedCoping: false,
    notes: "",
  });

  const submitEntry = async () => {
    try {
      await saveRecoveryEntry(entry);
      toast({ title: "Saved", description: "Your entry was recorded.", status: "success" });
      // refresh
      await loadAll();
      onClose();
      // reset some fields, keep date fresh
      setEntry((e) => ({ ...e, amount: "", notes: "", urgeDurationMin: "", trigger: "" }));
    } catch {
      toast({ title: "Save failed", status: "error" });
    }
  };

  // ----- Urge Surfing 3-min Timer -------------------------------------------
  useEffect(() => {
    if (!urgeTimer.running) return;
    const id = setInterval(() => {
      setUrgeTimer((t) => {
        if (t.secs <= 1) {
          clearInterval(id);
          toast({ title: "Urge Surf Complete", description: "Nice work riding the wave.", status: "success" });
          // auto log a coping action
          saveRecoveryEntry({
            date: new Date().toISOString(),
            type: "note",
            substance: entry.substance || "",
            usedCoping: true,
            notes: "Completed 3-minute urge-surfing practice.",
          }).then(loadAll).catch(() => {});
          return { running: false, secs: 180 };
        }
        return { ...t, secs: t.secs - 1 };
      });
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urgeTimer.running]);

  const startUrgeTimer = () => setUrgeTimer({ running: true, secs: 180 });
  const stopUrgeTimer = () => setUrgeTimer({ running: false, secs: 180 });

  // ----- Daily Plan state ----------------------------------------------------
  const togglePlanItem = (id) => {
    const next = plan.map((p) => (p.id === id ? { ...p, done: !p.done } : p));
    setPlan(next);
    localStorage.setItem("recovery:dailyPlan", JSON.stringify(next));
  };
  const resetPlan = () => {
    const next = plan.map((p) => ({ ...p, done: false }));
    setPlan(next);
    localStorage.setItem("recovery:dailyPlan", JSON.stringify(next));
  };
  const planProgress = Math.round((plan.filter((p) => p.done).length / plan.length) * 100);

  // ----- Helpers -------------------------------------------------------------
  const pad2 = (n) => (n < 10 ? `0${n}` : `${n}`);
  const fmtTimer = (s) => `${pad2(Math.floor(s / 60))}:${pad2(s % 60)}`;
  const levelColor = (n) => (n >= 7 ? "red" : n >= 4 ? "orange" : "green");

  return (
    <Box minH="100vh">
      {/* Hero */}
      <Box
        position="relative"
        bgGradient={`linear(to-r, ${heroFrom}, ${heroTo})`}
        color="white"
        px={{ base: 4, md: 8 }}
        py={{ base: 10, md: 14 }}
        borderBottomRadius={{ base: "2xl", md: "3xl" }}
        boxShadow="lux"
        overflow="hidden"
      >
        <VStack spacing={4} align="start" maxW="7xl" mx="auto">
          <HStack justify="space-between" w="100%" align="flex-start" flexWrap="wrap" gap={3}>
            <Box minW="240px">
              <Heading size="xl" fontWeight="800" letterSpacing=".3px">
                Recovery Intelligence
              </Heading>
              <Text opacity={0.95}>Personal snapshot, insights, and support</Text>
            </Box>
            <Badge colorScheme="purple" variant="solid" borderRadius="full" px={3}>
              <HStack spacing={2}>
                <Text>Stage: {stage}</Text>
                <Divider orientation="vertical" mx={1} />
                <Text>Days sober: {daysSober}</Text>
              </HStack>
            </Badge>
          </HStack>

          <Wrap spacing={3}>
            <WrapItem>
              <Button
                as={RouterLink}
                to="/recovery/coach"
                leftIcon={<FaRobot />}
                variant="outline"
                color="white"
                borderColor="whiteAlpha.500"
                size="sm"
              >
                AI Recovery Coach
              </Button>
            </WrapItem>

            <WrapItem>
              <Button
                as={RouterLink}
                to="/recovery/report"
                variant="outline"
                color="white"
                borderColor="whiteAlpha.500"
                size="sm"
              >
                Recovery Report
              </Button>
            </WrapItem>

            <WrapItem>
              <Button
                leftIcon={<DownloadIcon />}
                variant="outline"
                color="white"
                borderColor="whiteAlpha.500"
                onClick={() => setShowExport(!showExport)}
                size="sm"
              >
                Export Data
              </Button>
            </WrapItem>

            <WrapItem>
              <Button
                leftIcon={<AddIcon />}
                variant="solid"
                colorScheme="purple"
                onClick={onOpen}
                size="sm"
              >
                Log Intake / Craving
              </Button>
            </WrapItem>
          </Wrap>

          <Collapse in={showExport} animateOpacity>
            <Wrap spacing={2} mt={3} p={3} bg="whiteAlpha.200" borderRadius="lg">
              <Button size="sm" onClick={() => onExport("json")}>JSON</Button>
              <Button size="sm" onClick={() => onExport("csv")}>CSV</Button>
              <Button size="sm" onClick={() => window.print()}>PDF (Print)</Button>
            </Wrap>
          </Collapse>
        </VStack>
      </Box>

      {/* Content */}
      <Box px={{ base: 4, md: 8 }} pt={{ base: 6, md: 10 }} pb={{ base: 14, md: 20 }}>
        <SimpleGrid maxW="7xl" mx="auto" columns={{ base: 1, lg: 2, xl: 3 }} spacing={6}>
          {/* Snapshot metrics */}
          <GlassCard title="Snapshot" colSpan={{ base: 1, xl: 3 }}>
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
              <Stat>
                <StatLabel>Days Sober</StatLabel>
                <StatNumber>{daysSober}</StatNumber>
                <StatHelpText>Keep the streak going</StatHelpText>
              </Stat>
              <Stat>
                <StatLabel>Avg Cravings (7d)</StatLabel>
                <StatNumber>{cravingAvg}</StatNumber>
                <StatHelpText>Lower is better</StatHelpText>
              </Stat>
              <Stat>
                <StatLabel>Stage</StatLabel>
                <StatNumber textTransform="capitalize">{stage}</StatNumber>
                <StatHelpText>Self-reported</StatHelpText>
              </Stat>
              <Stat>
                <StatLabel>Top Trigger</StatLabel>
                <StatNumber fontSize="lg">
                  {snapshot?.risks?.topTriggers?.[0] || "—"}
                </StatNumber>
                <StatHelpText>Plan ahead</StatHelpText>
              </Stat>
            </SimpleGrid>
          </GlassCard>

          {/* Cravings trend */}
          <GlassCard title="Cravings Trend (last 8 days)" colSpan={{ base: 1, lg: 2 }}>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={cravingSeries}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <RTooltip />
                <Area type="monotone" dataKey="value" stroke="#805AD5" fill="#805AD5" fillOpacity={0.25} />
              </AreaChart>
            </ResponsiveContainer>
          </GlassCard>

          {/* Exposure bars */}
          <GlassCard title="High-Risk Exposure (weekly)">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weeklyExposure}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <RTooltip />
                <Bar dataKey="value" fill="#D69E2E" />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>

          {/* Daily Action Plan */}
          <GlassCard
            title="Daily Action Plan"
            right={
              <HStack>
                <Tag variant="subtle" colorScheme="purple" borderRadius="full">
                  <TagLabel>{planProgress}%</TagLabel>
                  <TagRightIcon as={FaHeartbeat} />
                </Tag>
                <Tooltip label="Reset today's checklist">
                  <Button size="xs" variant="outline" onClick={resetPlan}>Reset</Button>
                </Tooltip>
              </HStack>
            }
          >
            <VStack align="stretch" spacing={3}>
              <Progress value={planProgress} colorScheme={planProgress >= 80 ? "green" : planProgress >= 40 ? "yellow" : "purple"} borderRadius="full" />
              {plan.map((item) => (
                <HStack key={item.id} justify="space-between" p={2} bg={chipBg} borderRadius="md" border="1px solid" borderColor={chipBr}>
                  <Checkbox isChecked={item.done} onChange={() => togglePlanItem(item.id)}>
                    {item.label}
                  </Checkbox>
                </HStack>
              ))}
              <Text fontSize="xs" color={subText}>
                Tip: Turn these into “If–Then” rules. For example, “If I finish lunch, then I’ll take a 10-minute walk and text accountability partner.”
              </Text>
            </VStack>
          </GlassCard>

          {/* Coping Toolbox + Urge Surfing */}
          <GlassCard
            title="Coping Toolbox"
            right={
              <Tooltip label="3-minute urge-surfing timer">
                <Tag colorScheme={urgeTimer.running ? "green" : "gray"} borderRadius="full">
                  <TagLabel>{fmtTimer(urgeTimer.secs)}</TagLabel>
                  <TagRightIcon as={urgeTimer.running ? FaStop : FaPlay} />
                </Tag>
              </Tooltip>
            }
          >
            <VStack align="stretch" spacing={3}>
              <Wrap spacing={2}>
                {[
                  { id: "breath", label: "Box Breathing (4x4x4x4)" },
                  { id: "delay", label: "Delay + Distract 10 min" },
                  { id: "urgeSurf", label: "Urge Surf (3 min)" },
                  { id: "call", label: "Call/Text Support" },
                  { id: "change", label: "Change Location" },
                ].map((tool) => (
                  <WrapItem key={tool.id}>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (tool.id === "urgeSurf") {
                          if (!urgeTimer.running) startUrgeTimer();
                          else stopUrgeTimer();
                        }
                        saveRecoveryEntry({
                          date: new Date().toISOString(),
                          type: "note",
                          usedCoping: true,
                          notes: `Coping used: ${tool.label}`,
                        }).then(loadAll).catch(() => {});
                        toast({ title: tool.label, description: "Logged to your recovery history.", status: "success", duration: 1200 });
                      }}
                    >
                      {tool.label}
                    </Button>
                  </WrapItem>
                ))}
              </Wrap>
              <HStack fontSize="xs" opacity={0.8}>
                <InfoOutlineIcon />
                <Text>
                  Cravings typically peak within minutes and pass like a wave. Practice noticing sensations, label them, breathe, and ride it out.
                </Text>
              </HStack>
            </VStack>
          </GlassCard>

          {/* Intake & Craving Log */}
          <GlassCard
            title="Intake & Craving Log"
            right={
              <Button size="xs" leftIcon={<AddIcon />} onClick={onOpen} colorScheme="purple" variant="solid">
                Add Entry
              </Button>
            }
            colSpan={{ base: 1, xl: 3 }}
          >
            <Box w="100%" overflowX="auto" border="1px solid" borderColor={tableBorder} borderRadius="md">
              <Table size="sm" variant="simple" minW="720px">
                <Thead>
                  <Tr>
                    <Th>Date/Time</Th>
                    <Th>Type</Th>
                    <Th>Substance</Th>
                    <Th isNumeric>Amount</Th>
                    <Th isNumeric>Craving</Th>
                    <Th>Trigger</Th>
                    <Th>Notes</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {logs.slice(0, 12).map((row, i) => (
                    <Tr key={`${row.date}-${i}`}>
                      <Td>{formatLocal(row.date)}</Td>
                      <Td textTransform="capitalize">{row.type}</Td>
                      <Td>{row.substance || "—"}</Td>
                      <Td isNumeric>{row.amount || "—"}</Td>
                      <Td isNumeric>
                        {typeof row.cravingLevel === "number" ? (
                          <Tag size="sm" colorScheme={levelColor(row.cravingLevel)}>
                            <TagLabel>{row.cravingLevel}/10</TagLabel>
                          </Tag>
                        ) : "—"}
                      </Td>
                      <Td>{row.trigger || "—"}</Td>
                      <Td maxW="320px" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                        {row.notes || "—"}
                      </Td>
                    </Tr>
                  ))}
                  {logs.length === 0 && (
                    <Tr>
                      <Td colSpan={7}>
                        <Text fontSize="sm" opacity={0.7} textAlign="center" py={3}>
                          No entries yet. Click “Add Entry” to log your first craving/intake/exposure.
                        </Text>
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </Box>
          </GlassCard>

          {/* Insights */}
          <GlassCard title="AI Insights" colSpan={{ base: 1, xl: 3 }}>
            <VStack align="stretch" spacing={3}>
              <Badge colorScheme="purple" alignSelf="start">
                Score: {Math.round(insights?.score ?? 0)}/100
              </Badge>
              {(insights?.suggestions || []).map((s, i) => (
                <Card key={i} variant="outline">
                  <CardBody>
                    <Heading size="sm" mb={1}>{s.title}</Heading>
                    <Text fontSize="sm" color={subText}>{s.description}</Text>
                  </CardBody>
                </Card>
              ))}

              <HStack>
                <Button as={RouterLink} to="/recovery/coach" size="sm" colorScheme="purple">
                  Open AI Recovery Coach
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    saveRecoveryEntry({ type: "sober-day", date: new Date().toISOString() })
                      .then(loadAll)
                      .then(() => toast({ title: "Logged a sober day", status: "success" }))
                      .catch(() => toast({ title: "Failed to log sober day", status: "error" }))
                  }
                >
                  Log Sober Day
                </Button>
              </HStack>
            </VStack>
          </GlassCard>
        </SimpleGrid>
      </Box>

      {/* Add Entry Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Log Intake / Craving / Exposure</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>Date & Time</FormLabel>
                <Input
                  type="datetime-local"
                  value={entry.date}
                  onChange={(e) => setEntry({ ...entry, date: e.target.value })}
                />
              </FormControl>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Type</FormLabel>
                  <Select
                    value={entry.type}
                    onChange={(e) => setEntry({ ...entry, type: e.target.value })}
                  >
                    <option value="craving">Craving</option>
                    <option value="intake">Intake</option>
                    <option value="exposure">High-risk Exposure</option>
                    <option value="medication">Medication</option>
                    <option value="therapy">Therapy/Meeting</option>
                    <option value="note">Note</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Substance / Topic</FormLabel>
                  <Input
                    placeholder="e.g., Alcohol / Nicotine"
                    value={entry.substance}
                    onChange={(e) => setEntry({ ...entry, substance: e.target.value })}
                  />
                </FormControl>
              </SimpleGrid>

              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                <FormControl>
                  <FormLabel>Amount</FormLabel>
                  <Input
                    placeholder="e.g., 2 drinks / 5mg"
                    value={entry.amount}
                    onChange={(e) => setEntry({ ...entry, amount: e.target.value })}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Craving Level (0–10)</FormLabel>
                  <NumberInput min={0} max={10} value={entry.cravingLevel} onChange={(_, n) => setEntry({ ...entry, cravingLevel: Number.isNaN(n) ? 0 : n })}>
                    <NumberInputField />
                  </NumberInput>
                </FormControl>

                <FormControl>
                  <FormLabel>Urge Duration (min)</FormLabel>
                  <NumberInput min={0} value={entry.urgeDurationMin} onChange={(_, n) => setEntry({ ...entry, urgeDurationMin: Number.isNaN(n) ? "" : n })}>
                    <NumberInputField />
                  </NumberInput>
                </FormControl>
              </SimpleGrid>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl>
                  <FormLabel>Trigger</FormLabel>
                  <Input
                    placeholder="e.g., social event, stress, evening"
                    value={entry.trigger}
                    onChange={(e) => setEntry({ ...entry, trigger: e.target.value })}
                  />
                </FormControl>

                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">Used a Coping Skill?</FormLabel>
                  <Switch
                    isChecked={entry.usedCoping}
                    onChange={(e) => setEntry({ ...entry, usedCoping: e.target.checked })}
                  />
                </FormControl>
              </SimpleGrid>

              <FormControl>
                <FormLabel>Notes</FormLabel>
                <Textarea
                  rows={3}
                  placeholder="Context, what helped, what you'll try next time..."
                  value={entry.notes}
                  onChange={(e) => setEntry({ ...entry, notes: e.target.value })}
                />
              </FormControl>

              <HStack fontSize="xs" opacity={0.8}>
                <InfoOutlineIcon />
                <Text>Education only — not medical advice. If you’re in crisis, call local emergency services.</Text>
              </HStack>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
            <Button colorScheme="purple" onClick={submitEntry}>Save Entry</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

/* ----------------------- local helpers ----------------------- */
function formatLocal(iso) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  } catch {
    return iso;
  }
}
