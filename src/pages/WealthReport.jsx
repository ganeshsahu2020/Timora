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
  Container,
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
import { getWealthData, exportWealthReport } from "../services/wealthStore";

const COLORS = ["#805AD5", "#38A169", "#3182CE", "#E53E3E", "#D69E2E", "#319795"];

export default function WealthReport() {
  const toast = useToast();
  const [data, setData] = useState({});
  const [exporting, setExporting] = useState(false);
  const chipBg = useColorModeValue("blackAlpha.50", "whiteAlpha.100");
  const barBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  useEffect(() => {
    (async () => {
      try {
        const d = await getWealthData();
        setData(d || {});
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const shareText = useMemo(() => {
    const nw = ((data.assets || 0) - (data.liabilities || 0)).toLocaleString();
    const cf = (((data.monthlyIncome || 0) - (data.monthlyExpenses || 0)) || 0).toLocaleString();
    return `My Wealth Report — Net Worth $${nw}, Monthly Cash Flow $${cf}.`;
  }, [data]);

  const onPrint = () => window.print();

  const onShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Wealth Report",
          text: shareText,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(`${shareText} ${window.location.href}`);
        toast({ title: "Share text + link copied to clipboard.", status: "success" });
      }
    } catch {
      /* no-op */
    }
  };

  const onExport = async (fmt) => {
    setExporting(true);
    try {
      const res = await exportWealthReport(fmt);
      // If store returned a Blob, download here.
      if (res instanceof Blob) {
        const url = URL.createObjectURL(res);
        const a = document.createElement("a");
        a.href = url;
        a.download = `wealth-report.${fmt}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      } else if (fmt === "pdf") {
        // Fallback: print dialog for PDF
        onPrint();
      }
      toast({ title: `Exported ${fmt.toUpperCase()} successfully.`, status: "success" });
    } catch (e) {
      console.error("Export failed:", e);
      if (fmt === "pdf") {
        toast({
          title: "PDF generator unavailable — opening print dialog as a fallback.",
          status: "info",
        });
        onPrint();
      } else {
        toast({ title: `Export ${fmt.toUpperCase()} failed.`, status: "error" });
      }
    } finally {
      setExporting(false);
    }
  };

  const netWorth = (data.assets || 0) - (data.liabilities || 0);

  return (
    <Box px={{ base: 4, md: 8 }} py={{ base: 8, md: 10 }}>
      {/* Top action bar */}
      <Container maxW="7xl" p={0} mb={4}>
        <HStack justify="space-between" flexWrap="wrap" gap={3}>
          <HStack>
            <Heading size="lg">Wealth Report</Heading>
            <Badge colorScheme="green" variant="subtle" borderRadius="full">
              Updated
            </Badge>
          </HStack>

          <Wrap spacing={2}>
            <WrapItem>
              <Tooltip label="Print this report (or Save as PDF)">
                <Button leftIcon={<FiPrinter />} onClick={onPrint}>
                  Print / PDF
                </Button>
              </Tooltip>
            </WrapItem>
            <WrapItem>
              <Tooltip label="Share summary or copy link">
                <Button variant="outline" onClick={onShare}>
                  Share
                </Button>
              </Tooltip>
            </WrapItem>
            <WrapItem>
              <Button as={RouterLink} to="/wealth/recommendations" variant="outline">
                Recommendations
              </Button>
            </WrapItem>
            <WrapItem>
              <Button as={RouterLink} to="/wealth" rightIcon={<ExternalLinkIcon />}>
                Back to Wealth
              </Button>
            </WrapItem>
          </Wrap>
        </HStack>
      </Container>

      <SimpleGrid maxW="7xl" mx="auto" columns={{ base: 1, lg: 2, xl: 3 }} spacing={6}>
        <GlassCard title="Overview" colSpan={{ base: 1, xl: 3 }}>
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
            <Stat>
              <StatLabel>Net Worth</StatLabel>
              <StatNumber>${netWorth.toLocaleString()}</StatNumber>
              <StatHelpText>Total assets − liabilities</StatHelpText>
            </Stat>
            <Stat>
              <StatLabel>Monthly Income</StatLabel>
              <StatNumber>${(data.monthlyIncome || 0).toLocaleString()}</StatNumber>
              <StatHelpText>recurring inflows</StatHelpText>
            </Stat>
            <Stat>
              <StatLabel>Monthly Expenses</StatLabel>
              <StatNumber>${(data.monthlyExpenses || 0).toLocaleString()}</StatNumber>
              <StatHelpText>recurring outflows</StatHelpText>
            </Stat>
            <Stat>
              <StatLabel>Cash Flow</StatLabel>
              <StatNumber>
                ${(((data.monthlyIncome || 0) - (data.monthlyExpenses || 0)) || 0).toLocaleString()}
              </StatNumber>
              <StatHelpText>income − expenses</StatHelpText>
            </Stat>
          </SimpleGrid>
        </GlassCard>

        <GlassCard title="Net Worth Trend" colSpan={{ base: 1, lg: 2 }}>
          <Box bg={barBg} borderRadius="lg" border="1px solid" borderColor={borderColor} p={2}>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data.netWorthHistory || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <RTooltip />
                <Line type="monotone" dataKey="value" stroke="#805AD5" strokeWidth={3} dot />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </GlassCard>

        <GlassCard title="Asset Allocation">
          <Box bg={barBg} borderRadius="lg" border="1px solid" borderColor={borderColor} p={2}>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={data.assetAllocation || []}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={4}
                >
                  {(data.assetAllocation || []).map((s, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <RTooltip />
              </PieChart>
            </ResponsiveContainer>
          </Box>
          <Divider my={3} />
          <VStack align="stretch" spacing={2}>
            {(data.assetAllocation || []).map((s, i) => (
              <HStack key={s.name} justify="space-between">
                <HStack>
                  <Box w="3" h="3" borderRadius="full" bg={COLORS[i % COLORS.length]} />
                  <Text>{s.name}</Text>
                </HStack>
                <Badge>${(s.value || 0).toLocaleString()}</Badge>
              </HStack>
            ))}
          </VStack>
        </GlassCard>

        <GlassCard title="Cash Flow (Monthly)" colSpan={{ base: 1, lg: 2 }}>
          <Box bg={barBg} borderRadius="lg" border="1px solid" borderColor={borderColor} p={2}>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.cashFlowHistory || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <RTooltip />
                <Bar dataKey="income" fill="#38A169" name="Income" />
                <Bar dataKey="expenses" fill="#E53E3E" name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </GlassCard>

        <GlassCard title="Recent Transactions" colSpan={{ base: 1, xl: 3 }}>
          <Box w="100%" overflowX={{ base: "auto", md: "visible" }}>
            <Table size="sm" minW={{ base: "720px", md: "unset" }}>
              <Thead>
                <Tr>
                  <Th>Date</Th>
                  <Th>Description</Th>
                  <Th>Category</Th>
                  <Th isNumeric>Amount</Th>
                </Tr>
              </Thead>
              <Tbody>
                {(data.transactions || []).slice(0, 12).map((t, i) => (
                  <Tr key={i}>
                    <Td>{t.date}</Td>
                    <Td>{t.description}</Td>
                    <Td>{t.category}</Td>
                    <Td isNumeric>{t.type === "income" ? "+" : "-"}${t.amount}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </GlassCard>

        <GlassCard title="Export / Download" colSpan={{ base: 1, xl: 3 }}>
          <Wrap spacing={3}>
            <WrapItem>
              <Button leftIcon={<DownloadIcon />} onClick={() => onExport("pdf")} isLoading={exporting}>
                PDF Report
              </Button>
            </WrapItem>
            <WrapItem>
              <Button variant="outline" onClick={() => onExport("csv")} isLoading={exporting}>
                CSV Data
              </Button>
            </WrapItem>
            <WrapItem>
              <Button variant="outline" onClick={() => onExport("json")} isLoading={exporting}>
                JSON
              </Button>
            </WrapItem>
            <WrapItem>
              <Button as={RouterLink} to="/wealth" rightIcon={<ExternalLinkIcon />}>
                Back to Wealth
              </Button>
            </WrapItem>
          </Wrap>
        </GlassCard>
      </SimpleGrid>

      {/* Print styles */}
      <style>{`
        @media print {
          /* Hide interactive-only elements in print */
          button, a[href], .chakra-tooltip, [role="tooltip"] {
            display: none !important;
          }
          /* Expand to full width for charts/tables */
          .recharts-wrapper {
            width: 100% !important;
            height: auto !important;
          }
          /* Remove paddings for clean PDF */
          body, #root, .chakra-container, .chakra-box {
            background: white !important;
          }
        }
      `}</style>
    </Box>
  );
}
