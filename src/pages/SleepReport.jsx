// src/pages/SleepReport.jsx
import React, { useEffect, useState, useMemo } from "react";
import {
  Box, Heading, Text, VStack, HStack, Button, Badge, SimpleGrid, Divider,
  useColorModeValue, useToast, Tooltip, Stat, StatLabel, StatNumber, StatHelpText,
  Table, Thead, Tbody, Tr, Th, Td, Wrap, WrapItem
} from "@chakra-ui/react";
import { DownloadIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import { FiPrinter } from "react-icons/fi";
import { FaRobot } from "react-icons/fa";
import { Link as RouterLink } from "react-router-dom";
import GlassCard from "../components/GlassCard";
import {
  ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip as RTooltip,
  BarChart, Bar, PieChart, Pie, Cell
} from "recharts";
import { getSleepData, calculateSleepScore } from "../services/sleepStore";

export default function SleepReport() {
  const toast = useToast();
  const [data, setData] = useState({});
  const [sleepScore, setSleepScore] = useState(0);
  const [exporting, setExporting] = useState(false);
  const chipBg = useColorModeValue("blackAlpha.50", "whiteAlpha.100");

  useEffect(() => {
    (async () => {
      try {
        const d = await getSleepData();
        const s = await calculateSleepScore();
        setData(d || {});
        setSleepScore(s || 0);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const shareText = useMemo(() => {
    const avg = data?.averageDuration || "—";
    const eff = data?.efficiency ?? "—";
    return `My Sleep Report — Score ${sleepScore}/100, Avg ${avg}, Efficiency ${eff}%.`;
  }, [data, sleepScore]);

  const onPrint = () => window.print();

  const onShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Sleep Report",
          text: shareText,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(`${shareText} ${window.location.href}`);
        toast({ title: "Share link copied to clipboard.", status: "success" });
      }
    } catch {
      /* noop */
    }
  };

  // ---- Export helpers (no external libs) ------------------------------------
  const downloadBlob = (filename, mime, content) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const toCSV = () => {
    const rows = [
      ["Date", "Duration", "Quality", "Deep", "REM", "Wake-ups"],
      ...(data.sleepHistory || []).map(r => [
        r.date, r.duration, `${r.quality}%`, r.deepSleep, r.remSleep, r.wakeups
      ])
    ];
    return rows.map(r => r.map(v => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
  };

  const buildPrintableHTML = () => {
    const dist = (data.stagesDistribution || [])
      .map(s => `<tr><td>${s.name}</td><td style="text-align:right">${s.value}</td></tr>`).join("");

    const hist = (data.sleepHistory || [])
      .map(r => `
        <tr>
          <td>${r.date}</td><td>${r.duration}</td><td>${r.quality}%</td>
          <td>${r.deepSleep}</td><td>${r.remSleep}</td><td>${r.wakeups}</td>
        </tr>`).join("");

    return `
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Sleep Report</title>
<style>
  :root { --ink:#111; --muted:#666; --purple:#6b46c1; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji","Segoe UI Emoji"; margin: 24px; color: var(--ink); }
  h1 { margin: 0 0 8px; }
  h2 { margin: 16px 0 8px; color: var(--purple); }
  .grid { display: grid; grid-template-columns: repeat(12,1fr); gap: 16px; }
  .card { border:1px solid #e5e7eb; border-radius: 12px; padding: 16px; }
  .span-12 { grid-column: span 12; }
  .span-6 { grid-column: span 6; }
  .kpi { display:flex; gap:16px; }
  .kpi > div { flex:1; border:1px solid #e5e7eb; border-radius:12px; padding:12px; }
  table { width: 100%; border-collapse: collapse; }
  th, td { border-bottom: 1px solid #e5e7eb; padding: 8px 10px; font-size: 12.5px; }
  th { text-align: left; }
  .muted { color: var(--muted); }
  @media print {
    .no-print { display:none !important; }
    body { margin: 0.6in; }
  }
</style>
</head>
<body>
  <div class="no-print" style="text-align:right;margin-bottom:8px">
    <button onclick="window.print()">Print</button>
  </div>
  <h1>Sleep Report</h1>
  <div class="muted">Generated ${new Date().toLocaleString()}</div>

  <div class="card span-12" style="margin-top:12px">
    <div class="kpi">
      <div><div class="muted">Sleep Score</div><div style="font-weight:700;font-size:22px">${sleepScore}/100</div></div>
      <div><div class="muted">Avg. Duration</div><div style="font-weight:700;font-size:22px">${data.averageDuration ?? "—"}</div></div>
      <div><div class="muted">Efficiency</div><div style="font-weight:700;font-size:22px">${data.efficiency ?? "—"}%</div></div>
      <div><div class="muted">Consistency</div><div style="font-weight:700;font-size:22px">${data.consistency ?? "—"}%</div></div>
    </div>
  </div>

  <div class="grid" style="margin-top:12px">
    <div class="card span-6">
      <h2>Last Night</h2>
      <table>
        <tbody>
          <tr><td>Duration</td><td style="text-align:right">${data?.lastNight?.duration ?? "—"}</td></tr>
          <tr><td>Quality</td><td style="text-align:right">${data?.lastNight?.quality ?? "—"}%</td></tr>
          <tr><td>Deep</td><td style="text-align:right">${data?.lastNight?.deepSleep ?? "—"}</td></tr>
          <tr><td>REM</td><td style="text-align:right">${data?.lastNight?.remSleep ?? "—"}</td></tr>
        </tbody>
      </table>
    </div>

    <div class="card span-6">
      <h2>Stage Distribution</h2>
      <table>
        <thead><tr><th>Stage</th><th style="text-align:right">Value</th></tr></thead>
        <tbody>${dist}</tbody>
      </table>
    </div>

    <div class="card span-12">
      <h2>Raw History</h2>
      <table>
        <thead>
          <tr><th>Date</th><th>Duration</th><th>Quality</th><th>Deep</th><th>REM</th><th>Wake-ups</th></tr>
        </thead>
        <tbody>${hist}</tbody>
      </table>
    </div>
  </div>
</body>
</html>
`;
  };

  const onExport = async (fmt) => {
    setExporting(true);
    try {
      if (fmt === "pdf") {
        // Open a printable window with the report HTML; user can save as PDF
        const html = buildPrintableHTML();
        const w = window.open("", "_blank");
        if (!w) throw new Error("Popup blocked");
        w.document.open();
        w.document.write(html);
        w.document.close();
        // Give the window a beat to render, then trigger print
        setTimeout(() => { try { w.focus(); w.print(); } catch {} }, 350);
        toast({ title: "PDF preview opened. Use 'Save as PDF' to download.", status: "success" });
      } else if (fmt === "csv") {
        downloadBlob(`sleep-report-${Date.now()}.csv`, "text/csv;charset=utf-8", toCSV());
        toast({ title: "CSV downloaded.", status: "success" });
      } else if (fmt === "json") {
        downloadBlob(
          `sleep-report-${Date.now()}.json`,
          "application/json;charset=utf-8",
          JSON.stringify(data || {}, null, 2)
        );
        toast({ title: "JSON downloaded.", status: "success" });
      }
    } catch (e) {
      console.error("Export failed:", e);
      toast({ title: `Export ${fmt.toUpperCase()} failed.`, status: "error" });
    } finally {
      setExporting(false);
    }
  };

  const stageColor = (name) =>
    ({
      deep: "#3182CE",
      light: "#38A169",
      rem: "#805AD5",
      awake: "#E53E3E",
    }[name] || "#A0AEC0");

  return (
    <Box px={{ base: 4, md: 8 }} py={{ base: 8, md: 10 }}>
      <HStack justify="space-between" flexWrap="wrap" gap={3} mb={4}>
        <Heading size="lg">Sleep Report</Heading>
        <Wrap spacing={2}>
          <WrapItem>
            <Tooltip label="Print this report">
              <Button leftIcon={<FiPrinter />} onClick={onPrint}>Print</Button>
            </Tooltip>
          </WrapItem>
          <WrapItem>
            <Tooltip label="Share summary">
              <Button variant="outline" onClick={onShare}>Share</Button>
            </Tooltip>
          </WrapItem>
          <WrapItem>
            <Button
              as={RouterLink}
              to="/sleep/coach"
              leftIcon={<FaRobot />}
              colorScheme="purple"
              variant="outline"
            >
              Ask AI Coach
            </Button>
          </WrapItem>
        </Wrap>
      </HStack>

      <SimpleGrid maxW="7xl" mx="auto" columns={{ base: 1, lg: 2, xl: 3 }} spacing={6}>
        <GlassCard title="Overview" colSpan={{ base: 1, xl: 3 }}>
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
            <Stat>
              <StatLabel>Sleep Score</StatLabel>
              <StatNumber>{sleepScore}/100</StatNumber>
              <StatHelpText>overall</StatHelpText>
            </Stat>
            <Stat>
              <StatLabel>Avg. Duration</StatLabel>
              <StatNumber>{data.averageDuration || "—"}</StatNumber>
              <StatHelpText>last 14–30d</StatHelpText>
            </Stat>
            <Stat>
              <StatLabel>Efficiency</StatLabel>
              <StatNumber>{data.efficiency ?? "—"}%</StatNumber>
              <StatHelpText>asleep vs in bed</StatHelpText>
            </Stat>
            <Stat>
              <StatLabel>Consistency</StatLabel>
              <StatNumber>{data.consistency ?? "—"}%</StatNumber>
              <StatHelpText>timing regularity</StatHelpText>
            </Stat>
          </SimpleGrid>
        </GlassCard>

        <GlassCard title="Quality Trend" colSpan={{ base: 1, lg: 2 }}>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.qualityTrend || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <RTooltip />
              <Line type="monotone" dataKey="quality" stroke="#805AD5" strokeWidth={3} dot />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard title="Last Night">
          <VStack align="stretch" spacing={2}>
            <HStack justify="space-between">
              <Text>Duration</Text>
              <Badge colorScheme="blue">{data.lastNight?.duration || "—"}</Badge>
            </HStack>
            <HStack justify="space-between">
              <Text>Quality</Text>
              <Badge colorScheme="purple">{data.lastNight?.quality ?? "—"}%</Badge>
            </HStack>
            <HStack justify="space-between">
              <Text>Deep</Text>
              <Badge>{data.lastNight?.deepSleep || "—"}</Badge>
            </HStack>
            <HStack justify="space-between">
              <Text>REM</Text>
              <Badge>{data.lastNight?.remSleep || "—"}</Badge>
            </HStack>
          </VStack>
        </GlassCard>

        <GlassCard title="Stage Distribution">
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={data.stagesDistribution || []}
                dataKey="value" cx="50%" cy="50%" innerRadius={35} outerRadius={60}
              >
                {(data.stagesDistribution || []).map((s, i) => (
                  <Cell key={i} fill={stageColor(s.name)} />
                ))}
              </Pie>
              <RTooltip />
            </PieChart>
          </ResponsiveContainer>
          <Divider my={3} />
          <VStack align="stretch" spacing={2}>
            {(data.stagesDistribution || []).map((s) => (
              <HStack key={s.name} justify="space-between">
                <Text>{s.name}</Text>
                <Badge>{s.value}</Badge>
              </HStack>
            ))}
          </VStack>
        </GlassCard>

        <GlassCard title="Weekly Patterns" colSpan={{ base: 1, lg: 2 }}>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.weeklyPatterns || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <RTooltip />
              <Bar dataKey="duration" fill="#805AD5" name="Duration (h)" />
              <Bar dataKey="quality" fill="#38A169" name="Quality (%)" />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Raw History — scrollable on small screens with sensible min width */}
        <GlassCard title="Raw History" colSpan={{ base: 1, xl: 3 }}>
          <Box w="100%" overflowX={{ base: "auto", md: "visible" }}>
            <Table size="sm" minW={{ base: "720px", md: "unset" }}>
              <Thead>
                <Tr>
                  <Th>Date</Th>
                  <Th>Duration</Th>
                  <Th>Quality</Th>
                  <Th>Deep</Th>
                  <Th>REM</Th>
                  <Th>Wake-ups</Th>
                </Tr>
              </Thead>
              <Tbody>
                {(data.sleepHistory || []).map((r, i) => (
                  <Tr key={i}>
                    <Td>{r.date}</Td>
                    <Td>{r.duration}</Td>
                    <Td>{r.quality}%</Td>
                    <Td>{r.deepSleep}</Td>
                    <Td>{r.remSleep}</Td>
                    <Td>{r.wakeups}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </GlassCard>

        <GlassCard title="Export / Download" colSpan={{ base: 1, xl: 3 }}>
          <Wrap spacing={3}>
            <WrapItem>
              <Button
                leftIcon={<DownloadIcon />}
                onClick={() => onExport("pdf")}
                isLoading={exporting}
              >
                PDF Report
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
              <Button as={RouterLink} to="/sleep" rightIcon={<ExternalLinkIcon />}>
                Back to Sleep
              </Button>
            </WrapItem>
          </Wrap>
        </GlassCard>
      </SimpleGrid>
    </Box>
  );
}
