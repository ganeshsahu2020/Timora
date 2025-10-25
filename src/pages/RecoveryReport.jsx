// src/pages/RecoveryReport.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Badge,
  SimpleGrid,
  Divider,
  useColorModeValue,
  useToast,
  Tooltip,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Wrap,
  WrapItem,
  Checkbox,
} from "@chakra-ui/react";
import { DownloadIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import { FiPrinter } from "react-icons/fi";
import { Link as RouterLink } from "react-router-dom";
import GlassCard from "../components/GlassCard";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import {
  getRecoverySnapshot,
  generateRecoveryInsights,
  exportRecoveryData,
} from "../services/recoveryStore";

const COLORS = ["#805AD5", "#38A169", "#3182CE", "#E53E3E", "#D69E2E", "#319795"];

export default function RecoveryReport() {
  const toast = useToast();
  const [snapshot, setSnapshot] = useState(null);
  const [insights, setInsights] = useState(null);
  const [exporting, setExporting] = useState(false);
  const chipBg = useColorModeValue("blackAlpha.50", "whiteAlpha.100");

  useEffect(() => {
    (async () => {
      try {
        const s = await getRecoverySnapshot();
        const i = await generateRecoveryInsights();
        setSnapshot(s || {});
        setInsights(i || {});
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  // -------- Derived values --------
  const daysSober = snapshot?.pattern?.daysSober || 0;
  const cravingsAvg = snapshot?.cravings?.last7dAvg ?? 0;
  const stage = snapshot?.pattern?.stage || "action";
  const topTriggers = snapshot?.risks?.topTriggers || [];
  const highRiskTimes = snapshot?.risks?.highRiskTimes || [];
  const highRiskPlaces = snapshot?.risks?.highRiskPlaces || [];
  const contacts = snapshot?.supports?.contacts || [];

  // A small synthetic time series (replace with real history when available)
  const cravingsSeries = useMemo(() => {
    const base = cravingsAvg || 2.5;
    return Array.from({ length: 12 }).map((_, i) => ({
      day: `D-${11 - i}`,
      value: Math.max(0, Math.round((base + (Math.random() - 0.5)) * 10) / 10),
    }));
  }, [cravingsAvg]);

  const exposureData = useMemo(() => {
    const pairs = [
      ["Social", 3],
      ["Stress", 4],
      ["Evenings", 5],
      ["Lonely time", 3],
      ["Environment", 2],
    ];
    return pairs.map(([label, value]) => ({ label, value }));
  }, []);

  const planChecklist = [
    "Write a SMART goal for the next 7 days",
    "Identify 3 top triggers and one counter-strategy each",
    "Prepare a 10-minute evening wind-down routine",
    "Add two peers to your quick-dial list",
    "Create an if-then implementation intention for your peak craving time",
    "Set a 24/7 helpline/clinic card in wallet/notes",
  ];

  // Share text
  const shareText = useMemo(() => {
    const score = Math.round(insights?.score ?? 0);
    const primary = topTriggers[0] ? `Top trigger: ${topTriggers[0]}` : "Personalized plan inside.";
    return `My Recovery Report — ${daysSober} day(s) sober, cravings avg ${cravingsAvg}/day, score ${score}/100. ${primary}`;
  }, [insights, daysSober, cravingsAvg, topTriggers]);

  const onPrint = () => window.print();

  const onShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Recovery Report",
          text: shareText,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(`${shareText} ${window.location.href}`);
        toast({ title: "Share link copied to clipboard.", status: "success" });
      }
    } catch {
      /* no-op */
    }
  };

  const onExport = async (fmt) => {
    setExporting(true);
    try {
      // json/csv handled inside exportRecoveryData (triggers download).
      if (fmt === "json" || fmt === "csv") {
        await exportRecoveryData(fmt);
        toast({ title: `Exported ${fmt.toUpperCase()} successfully.`, status: "success" });
      } else if (fmt === "pdf") {
        toast({
          title: "Print to PDF",
          description: "Using your browser’s print dialog.",
          status: "info",
        });
        onPrint();
      }
    } catch (e) {
      console.error("Export failed:", e);
      toast({ title: `Export ${fmt.toUpperCase()} failed.`, status: "error" });
    } finally {
      setExporting(false);
    }
  };

  return (
    <Box px={{ base: 4, md: 8 }} py={{ base: 8, md: 10 }}>
      <HStack justify="space-between" flexWrap="wrap" gap={3} mb={4}>
        <Heading size="lg">Recovery Report</Heading>
        <Wrap spacing={2}>
          <WrapItem>
            <Tooltip label="Print this report (or Save as PDF)">
              <Button leftIcon={<FiPrinter />} onClick={onPrint}>
                Print
              </Button>
            </Tooltip>
          </WrapItem>
          <WrapItem>
            <Tooltip label="Share summary">
              <Button variant="outline" onClick={onShare}>
                Share
              </Button>
            </Tooltip>
          </WrapItem>
          <WrapItem>
            <Button as={RouterLink} to="/recovery" rightIcon={<ExternalLinkIcon />}>
              Back to Recovery
            </Button>
          </WrapItem>
        </Wrap>
      </HStack>

      <SimpleGrid maxW="7xl" mx="auto" columns={{ base: 1, lg: 2, xl: 3 }} spacing={6}>
        {/* Overview */}
        <GlassCard title="Overview" colSpan={{ base: 1, xl: 3 }}>
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
            <Stat>
              <StatLabel>Days Sober</StatLabel>
              <StatNumber>{daysSober}</StatNumber>
              <StatHelpText>Keep the streak going</StatHelpText>
            </Stat>
            <Stat>
              <StatLabel>Cravings (avg 7d)</StatLabel>
              <StatNumber>{cravingsAvg}</StatNumber>
              <StatHelpText>Lower is better</StatHelpText>
            </Stat>
            <Stat>
              <StatLabel>Stage</StatLabel>
              <StatNumber textTransform="capitalize">{stage}</StatNumber>
              <StatHelpText>Self-reported</StatHelpText>
            </Stat>
            <Stat>
              <StatLabel>Recovery Score</StatLabel>
              <StatNumber>{Math.round(insights?.score ?? 0)}/100</StatNumber>
              <StatHelpText>AI snapshot</StatHelpText>
            </Stat>
          </SimpleGrid>
        </GlassCard>

        {/* Trend */}
        <GlassCard title="Cravings Trend (last 12 days)" colSpan={{ base: 1, lg: 2 }}>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={cravingsSeries}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <RTooltip />
              <Line type="monotone" dataKey="value" stroke="#805AD5" strokeWidth={3} dot />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Exposure */}
        <GlassCard title="High-Risk Exposure (weekly)">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={exposureData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <RTooltip />
              <Bar dataKey="value" fill="#D69E2E" name="Exposure Index" />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Triggers & Windows */}
        <GlassCard title="Triggers & Risk Windows" colSpan={{ base: 1, lg: 2 }}>
          <VStack align="stretch" spacing={3}>
            <HStack justify="space-between">
              <Text fontWeight="600">Top Triggers</Text>
            </HStack>
            <VStack align="stretch" spacing={2}>
              {topTriggers.length ? (
                topTriggers.map((t, i) => (
                  <HStack key={t} justify="space-between">
                    <HStack>
                      <Box w="3" h="3" borderRadius="full" bg={COLORS[i % COLORS.length]} />
                      <Text>{t}</Text>
                    </HStack>
                    <Badge variant="subtle"># {i + 1}</Badge>
                  </HStack>
                ))
              ) : (
                <Text color="gray.500">No triggers listed.</Text>
              )}
            </VStack>

            <Divider my={3} />

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <Box>
                <Text fontWeight="600" mb={2}>
                  High-Risk Times
                </Text>
                <VStack align="stretch" spacing={2}>
                  {highRiskTimes.length ? (
                    highRiskTimes.map((t) => (
                      <Badge key={t} colorScheme="purple" variant="subtle" alignSelf="start">
                        {t}
                      </Badge>
                    ))
                  ) : (
                    <Text color="gray.500">None listed.</Text>
                  )}
                </VStack>
              </Box>
              <Box>
                <Text fontWeight="600" mb={2}>
                  High-Risk Places
                </Text>
                <VStack align="stretch" spacing={2}>
                  {highRiskPlaces.length ? (
                    highRiskPlaces.map((p) => (
                      <Badge key={p} colorScheme="red" variant="subtle" alignSelf="start">
                        {p}
                      </Badge>
                    ))
                  ) : (
                    <Text color="gray.500">None listed.</Text>
                  )}
                </VStack>
              </Box>
            </SimpleGrid>
          </VStack>
        </GlassCard>

        {/* Plan checklist */}
        <GlassCard title="7-Day Starter Plan (Checklist)">
          <VStack align="stretch" spacing={2}>
            {planChecklist.map((item) => (
              <HStack key={item} p={2} bg={chipBg} borderRadius="md" justify="space-between">
                <Text fontSize="sm">{item}</Text>
                <Checkbox colorScheme="purple" />
              </HStack>
            ))}
          </VStack>
        </GlassCard>

        {/* Contacts & Relapse history */}
        <GlassCard title="Supports & History" colSpan={{ base: 1, xl: 3 }}>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <Box>
              <Text fontWeight="600" mb={2}>
                Support Contacts
              </Text>
              <Box w="100%" overflowX={{ base: "auto", md: "visible" }}>
                <Table size="sm" minW={{ base: "520px", md: "unset" }}>
                  <Thead>
                    <Tr>
                      <Th>Name</Th>
                      <Th>Relation</Th>
                      <Th>Phone</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {(contacts.length ? contacts : [{ name: "—", relation: "—", phone: "—" }]).map(
                      (c, i) => (
                        <Tr key={i}>
                          <Td>{c.name || "—"}</Td>
                          <Td>{c.relation || "—"}</Td>
                          <Td>{c.phone || "—"}</Td>
                        </Tr>
                      )
                    )}
                  </Tbody>
                </Table>
              </Box>
            </Box>

            <Box>
              <Text fontWeight="600" mb={2}>
                Recent Relapse Notes
              </Text>
              <Box w="100%" overflowX={{ base: "auto", md: "visible" }}>
                <Table size="sm" minW={{ base: "580px", md: "unset" }}>
                  <Thead>
                    <Tr>
                      <Th>Date</Th>
                      <Th>Trigger</Th>
                      <Th isNumeric>Intensity</Th>
                      <Th>Notes</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {(snapshot?.relapseHistory || []).slice(-6).map((r, i) => (
                      <Tr key={`${r.date}-${i}`}>
                        <Td>{r.date}</Td>
                        <Td>{r.trigger}</Td>
                        <Td isNumeric>{r.intensity}</Td>
                        <Td>{r.notes}</Td>
                      </Tr>
                    ))}
                    {(!snapshot?.relapseHistory || snapshot.relapseHistory.length === 0) && (
                      <Tr>
                        <Td colSpan={4}>
                          <Text color="gray.500">No relapse notes recorded.</Text>
                        </Td>
                      </Tr>
                    )}
                  </Tbody>
                </Table>
              </Box>
            </Box>
          </SimpleGrid>
        </GlassCard>

        {/* Export / Download */}
        <GlassCard title="Export / Download" colSpan={{ base: 1, xl: 3 }}>
          <Wrap spacing={3}>
            <WrapItem>
              <Button
                leftIcon={<DownloadIcon />}
                onClick={() => onExport("pdf")}
                isLoading={exporting}
              >
                PDF (Print)
              </Button>
            </WrapItem>
            <WrapItem>
              <Button
                variant="outline"
                onClick={() => onExport("csv")}
                isLoading={exporting}
              >
                CSV Data
              </Button>
            </WrapItem>
            <WrapItem>
              <Button
                variant="outline"
                onClick={() => onExport("json")}
                isLoading={exporting}
              >
                JSON
              </Button>
            </WrapItem>
            <WrapItem>
              <Button as={RouterLink} to="/recovery" rightIcon={<ExternalLinkIcon />}>
                Back to Recovery
              </Button>
            </WrapItem>
          </Wrap>
        </GlassCard>
      </SimpleGrid>
    </Box>
  );
}
