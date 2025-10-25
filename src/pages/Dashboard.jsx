// src/pages/Dashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Box, Heading, Text, SimpleGrid, HStack, Badge, VStack, Button, Wrap, WrapItem,
  useToast, useColorModeValue, Progress, Divider, Tooltip, Stat, StatLabel, StatNumber,
  StatHelpText, StatArrow, Avatar, Icon, Tag, TagLabel, TagRightIcon, Skeleton, SkeletonText
} from "@chakra-ui/react";
import {
  FaChartLine, FaCrown, FaRobot, FaDollarSign, FaMoon, FaBed, FaAward, FaHeartbeat,
  FaArrowRight, FaChartPie
} from "react-icons/fa";
import { Link as RouterLink } from "react-router-dom";
import GlassCard from "../components/GlassCard";

import {
  ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip as RTooltip,
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell
} from "recharts";

/* ---------- Data services (existing) ---------- */
// Habits
import {
  getUserHabits,
  getHabitSeries,
  generateHabitInsights,
} from "../services/dataStore";

// Wealth
import {
  getWealthData,
  generateFinancialInsights,
} from "../services/wealthStore";

// Sleep
import {
  getSleepData,
  calculateSleepScore,
} from "../services/sleepStore";

// Recovery
import {
  getRecoverySnapshot,
  generateRecoveryInsights,
} from "../services/recoveryStore";

export default function Dashboard() {
  const toast = useToast();

  // Theme tokens
  const heroFrom = useColorModeValue("brand.500", "brand.600");
  const heroTo   = useColorModeValue("brand.700", "brand.700");
  const subText  = useColorModeValue("gray.700", "gray.300");
  const chipBg   = useColorModeValue("blackAlpha.50", "whiteAlpha.100");
  const chipBr   = useColorModeValue("blackAlpha.200", "whiteAlpha.300");

  // ---- State ---------------------------------------------------------------
  const [loading, setLoading] = useState(true);

  // Habits
  const [habits, setHabits] = useState([]);
  const [habitSeries, setHabitSeries] = useState([]);
  const [habitInsights, setHabitInsights] = useState({});

  // Wealth
  const [wealth, setWealth] = useState({});
  const [wealthInsights, setWealthInsights] = useState({});

  // Sleep
  const [sleep, setSleep] = useState({});
  const [sleepScore, setSleepScore] = useState(0);

  // Recovery
  const [recovery, setRecovery] = useState({});
  const [recoveryInsights, setRecoveryInsights] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const [
          userHabits,
          series,
          hInsights,
          wData,
          wInsights,
          sData,
          sScore,
          rSnap,
          rInsights
        ] = await Promise.all([
          getUserHabits(),
          getHabitSeries?.() ?? [],
          generateHabitInsights(),
          getWealthData(),
          generateFinancialInsights(),
          getSleepData(),
          calculateSleepScore(),
          getRecoverySnapshot(),
          generateRecoveryInsights(),
        ]);

        setHabits(userHabits || []);
        setHabitSeries(series || []);
        setHabitInsights(hInsights || {});

        setWealth(wData || {});
        setWealthInsights(wInsights || {});

        setSleep(sData || {});
        setSleepScore(sScore || 0);

        setRecovery(rSnap || {});
        setRecoveryInsights(rInsights || {});
      } catch (e) {
        console.error(e);
        toast({ title: "Error loading dashboard data", status: "error" });
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Derived helpers -----------------------------------------------------
  const netWorth = useMemo(() => {
    const assets = wealth.assets || 0;
    const liabilities = wealth.liabilities || 0;
    return assets - liabilities;
  }, [wealth]);

  const savingsRate = useMemo(() => {
    const income = wealth.totalIncome || 1;
    const expenses = wealth.totalExpenses || 0;
    return Math.max(0, Math.min(100, ((income - expenses) / income) * 100));
  }, [wealth]);

  const daysSober = recovery?.pattern?.daysSober || 0;
  const recoveryStage = (recovery?.pattern?.stage || "action");

  const topHabit = useMemo(() => {
    if (!habits?.length) return null;
    return [...habits].sort((a, b) => (b.streak || 0) - (a.streak || 0))[0];
  }, [habits]);

  // Faux tiny series if empty to avoid chart crash
  const ensureSeries = (arr, key = "value") =>
    (Array.isArray(arr) && arr.length ? arr : [
      { date: "D-6", [key]: 2 },
      { date: "D-5", [key]: 3 },
      { date: "D-4", [key]: 4 },
      { date: "D-3", [key]: 3 },
      { date: "D-2", [key]: 5 },
      { date: "D-1", [key]: 4 },
      { date: "D-0", [key]: 6 },
    ]);

  const COLORS = ["#805AD5", "#38A169", "#3182CE", "#D69E2E", "#E53E3E", "#718096"];

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
            <Box>
              <Heading size="xl" fontWeight="800" letterSpacing=".3px">
                TIMORA — Dashboard
              </Heading>
              <Text opacity={0.95}>
                Small Habits, Big Momentum. With Timora, your priorities become a simple, sustainable routine—no hustle required
              </Text>
            </Box>
            <Badge colorScheme="purple" variant="solid" borderRadius="full" px={3}>
              <HStack spacing={2}>
                <FaChartLine />
                <Text>Today at a glance</Text>
              </HStack>
            </Badge>
          </HStack>

          {/* Quick Actions */}
          <Wrap spacing={3} shouldWrapChildren>
            <Button as={RouterLink} to="/habits" leftIcon={<FaCrown />} variant="outline" color="white" borderColor="whiteAlpha.500" size="sm">
              Habits
            </Button>
            <Button as={RouterLink} to="/wealth" leftIcon={<FaDollarSign />} variant="outline" color="white" borderColor="whiteAlpha.500" size="sm">
              Wealth
            </Button>
            <Button as={RouterLink} to="/sleep" leftIcon={<FaBed />} variant="outline" color="white" borderColor="whiteAlpha.500" size="sm">
              Sleep
            </Button>
            <Button as={RouterLink} to="/recovery" leftIcon={<FaHeartbeat />} variant="outline" color="white" borderColor="whiteAlpha.500" size="sm">
              Recovery
            </Button>
            <Button as={RouterLink} to="/insights" leftIcon={<FaRobot />} variant="outline" color="white" borderColor="whiteAlpha.500" size="sm">
              AI Insights
            </Button>
          </Wrap>
        </VStack>
      </Box>

      {/* Content */}
      <Box px={{ base: 4, md: 8 }} pt={{ base: 6, md: 10 }} pb={{ base: 14, md: 20 }}>
        <SimpleGrid maxW="7xl" mx="auto" columns={{ base: 1, lg: 2, xl: 3 }} spacing={6}>

          {/* ---------- Habits Overview ---------- */}
          <GlassCard
            title="🔥 Habits Overview"
            right={
              <Button as={RouterLink} to="/habits" size="xs" variant="outline" rightIcon={<FaArrowRight />}>
                Open
              </Button>
            }
          >
            {loading ? (
              <SkeletonGroup />
            ) : (
              <VStack align="stretch" spacing={3}>
                <HStack justify="space-between">
                  <Stat>
                    <StatLabel>Total Habits</StatLabel>
                    <StatNumber>{habits?.length || 0}</StatNumber>
                    <StatHelpText>Tracked</StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel>Best Streak</StatLabel>
                    <StatNumber>{topHabit?.streak || 0} days</StatNumber>
                    <StatHelpText>{topHabit?.name || "—"}</StatHelpText>
                  </Stat>
                </HStack>

                <Box minW={0} width="100%">
                  <ResponsiveContainer width="100%" height={160}>
                    <AreaChart data={ensureSeries(habitSeries, "value")}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <RTooltip />
                      <Area type="monotone" dataKey="value" stroke="#805AD5" fill="#805AD5" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>

                <Wrap spacing={2}>
                  {(habitInsights?.predictiveSchedule || []).slice(0, 3).map((slot, i) => (
                    <Tag key={i} size="sm" variant="subtle" bg={chipBg} border="1px solid" borderColor={chipBr}>
                      <TagLabel>{slot.habit}: {slot.time}</TagLabel>
                    </Tag>
                  ))}
                </Wrap>

                <HStack>
                  <Button as={RouterLink} to="/habits/coach" size="sm" leftIcon={<FaRobot />} colorScheme="purple">
                    AI Habits Coach
                  </Button>
                </HStack>
              </VStack>
            )}
          </GlassCard>

          {/* ---------- Wealth Snapshot ---------- */}
          <GlassCard
            title="💰 Wealth Snapshot"
            right={
              <Button as={RouterLink} to="/wealth" size="xs" variant="outline" rightIcon={<FaArrowRight />}>
                Open
              </Button>
            }
          >
            {loading ? (
              <SkeletonGroup />
            ) : (
              <VStack align="stretch" spacing={3}>
                <SimpleGrid columns={2} spacing={4}>
                  <Stat>
                    <StatLabel>Net Worth</StatLabel>
                    <StatNumber>${netWorth.toLocaleString()}</StatNumber>
                    <StatHelpText>
                      <StatArrow type={netWorth >= 0 ? "increase" : "decrease"} />
                      Assets − Liabilities
                    </StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel>Savings Rate</StatLabel>
                    <StatNumber>{savingsRate.toFixed(1)}%</StatNumber>
                    <StatHelpText>Monthly</StatHelpText>
                  </Stat>
                </SimpleGrid>

                <Box minW={0} width="100%">
                  <ResponsiveContainer width="100%" height={160}>
                    <LineChart data={wealth?.netWorthHistory || []}>
                      <XAxis dataKey="date" />
                      <YAxis />
                      <RTooltip />
                      <Line type="monotone" dataKey="value" stroke="#38A169" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>

                <HStack justify="space-between">
                  <Text fontSize="sm" color={subText}>Top Allocation</Text>
                  <Text fontSize="sm" fontWeight="600">
                    {(wealth?.assetAllocation?.[0]?.name) ? `${wealth.assetAllocation[0].name} — $${wealth.assetAllocation[0].value.toLocaleString()}` : "—"}
                  </Text>
                </HStack>

                <HStack>
                  <Button as={RouterLink} to="/wealth/advisor" size="sm" leftIcon={<FaRobot />} colorScheme="purple">
                    AI Financial Advisor
                  </Button>
                  <Button as={RouterLink} to="/wealth/report" size="sm" variant="ghost" leftIcon={<FaChartPie />}>
                    Report
                  </Button>
                </HStack>
              </VStack>
            )}
          </GlassCard>

          {/* ---------- Sleep Overview ---------- */}
          <GlassCard
            title="🌙 Sleep Overview"
            right={
              <Button as={RouterLink} to="/sleep" size="xs" variant="outline" rightIcon={<FaArrowRight />}>
                Open
              </Button>
            }
          >
            {loading ? (
              <SkeletonGroup />
            ) : (
              <VStack align="stretch" spacing={3}>
                <SimpleGrid columns={3} spacing={4}>
                  <Stat>
                    <StatLabel>Sleep Score</StatLabel>
                    <StatNumber>{sleepScore}/100</StatNumber>
                    <StatHelpText>Overall</StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel>Avg. Duration</StatLabel>
                    <StatNumber>{sleep.averageDuration || "7h 30m"}</StatNumber>
                    <StatHelpText>Recent</StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel>Wake-ups</StatLabel>
                    <StatNumber>{sleep?.lastNight?.wakeups ?? 0}</StatNumber>
                    <StatHelpText>Last Night</StatHelpText>
                  </Stat>
                </SimpleGrid>

                <Box minW={0} width="100%">
                  <ResponsiveContainer width="100%" height={160}>
                    <AreaChart data={sleep?.qualityTrend || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 100]} />
                      <RTooltip />
                      <Area type="monotone" dataKey="quality" stroke="#805AD5" fill="#805AD5" fillOpacity={0.25} />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>

                <HStack justify="space-between">
                  <Text fontSize="sm" color={subText}>Deep Sleep</Text>
                  <Badge colorScheme="blue">{sleep?.lastNight?.deepSleep || "—"}</Badge>
                </HStack>

                <HStack>
                  <Button as={RouterLink} to="/sleep/coach" size="sm" leftIcon={<FaRobot />} colorScheme="purple">
                    AI Sleep Coach
                  </Button>
                  <Button as={RouterLink} to="/sleep/report" size="sm" variant="ghost" leftIcon={<FaMoon />}>
                    Export
                  </Button>
                </HStack>
              </VStack>
            )}
          </GlassCard>

          {/* ---------- Recovery Overview ---------- */}
          <GlassCard
            title="🛡️ Recovery Overview"
            right={
              <Button as={RouterLink} to="/recovery" size="xs" variant="outline" rightIcon={<FaArrowRight />}>
                Open
              </Button>
            }
          >
            {loading ? (
              <SkeletonGroup />
            ) : (
              <VStack align="stretch" spacing={3}>
                <SimpleGrid columns={3} spacing={4}>
                  <Stat>
                    <StatLabel>Days Sober</StatLabel>
                    <StatNumber>{daysSober}</StatNumber>
                    <StatHelpText>Keep going</StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel>Avg Cravings (7d)</StatLabel>
                    <StatNumber>{recovery?.cravings?.last7dAvg ?? 0}</StatNumber>
                    <StatHelpText>Lower is better</StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel>Stage</StatLabel>
                    <StatNumber textTransform="capitalize">{recoveryStage}</StatNumber>
                    <StatHelpText>Self-reported</StatHelpText>
                  </Stat>
                </SimpleGrid>

                <Box minW={0} width="100%">
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart
                      data={(recoveryInsights?.weeklyExposure || [
                        { label: "Social", value: 3 },
                        { label: "Stress", value: 4 },
                        { label: "Evenings", value: 5 },
                      ])}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" />
                      <YAxis />
                      <RTooltip />
                      <Bar dataKey="value" fill="#D69E2E" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>

                <Wrap spacing={2}>
                  {(recovery?.risks?.topTriggers || []).slice(0, 3).map((t, i) => (
                    <Tag key={i} size="sm" variant="subtle" bg={chipBg} border="1px solid" borderColor={chipBr}>
                      <TagLabel>{t}</TagLabel>
                    </Tag>
                  ))}
                </Wrap>

                <HStack>
                  <Button as={RouterLink} to="/recovery/coach" size="sm" leftIcon={<FaRobot />} colorScheme="purple">
                    AI Recovery Coach
                  </Button>
                  <Button as={RouterLink} to="/recovery/report" size="sm" variant="ghost">
                    Report
                  </Button>
                </HStack>
              </VStack>
            )}
          </GlassCard>

          {/* ---------- Today’s Plan / Shortcuts ---------- */}
          <GlassCard title="Today’s Plan & Shortcuts" colSpan={{ base: 1, xl: 3 }}>
            {loading ? (
              <SkeletonGroup lines={2} />
            ) : (
              <VStack align="stretch" spacing={3}>
                <Wrap spacing={3}>
                  {/* Habits quick action */}
                  <WrapItem>
                    <Button as={RouterLink} to="/habits" size="sm" variant="outline" leftIcon={<FaCrown />}>
                      Track Habits
                    </Button>
                  </WrapItem>

                  {/* Wealth quick action */}
                  <WrapItem>
                    <Button as={RouterLink} to="/wealth" size="sm" variant="outline" leftIcon={<FaDollarSign />}>
                      Add Transaction
                    </Button>
                  </WrapItem>

                  {/* Sleep quick action */}
                  <WrapItem>
                    <Button as={RouterLink} to="/sleep" size="sm" variant="outline" leftIcon={<FaBed />}>
                      Log Sleep
                    </Button>
                  </WrapItem>

                  {/* Recovery quick action */}
                  <WrapItem>
                    <Button as={RouterLink} to="/recovery" size="sm" variant="outline" leftIcon={<FaHeartbeat />}>
                      Log Craving/Intake
                    </Button>
                  </WrapItem>

                  {/* Global AI */}
                  <WrapItem>
                    <Button as={RouterLink} to="/insights" size="sm" colorScheme="purple" leftIcon={<FaRobot />}>
                      Ask the AI
                    </Button>
                  </WrapItem>
                </Wrap>

                <Divider />

                <HStack justify="space-between" align="center" flexWrap="wrap" gap={3}>
                  <HStack>
                    <Avatar size="sm" name="You" />
                    <Text fontWeight="600">You’ve got this. Small steps compound daily. 🚀</Text>
                  </HStack>
                  <HStack>
                    <Tag colorScheme="purple" variant="subtle" borderRadius="full">
                      <TagLabel>Consistency</TagLabel>
                      <TagRightIcon as={FaChartLine} />
                    </Tag>
                  </HStack>
                </HStack>
              </VStack>
            )}
          </GlassCard>
        </SimpleGrid>
      </Box>
    </Box>
  );
}

/* ---------- Small skeleton for loading states ---------- */
function SkeletonGroup({ lines = 3 }) {
  return (
    <Box>
      <Skeleton height="18px" mb={3} />
      <Skeleton height="160px" mb={3} />
      <SkeletonText noOfLines={lines} spacing="3" />
    </Box>
  );
}
