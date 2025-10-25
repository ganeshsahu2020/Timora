import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Heading,
  Text,
  Stack,
  Badge,
  Button,
  HStack,
  useColorModeValue,
  VStack,
  Progress,
  SimpleGrid,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Card,
  CardBody,
  Icon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { DownloadIcon, RepeatIcon, CalendarIcon, TimeIcon, StarIcon } from '@chakra-ui/icons';
import { Link as RouterLink } from 'react-router-dom';
import {
  FaChartLine,
  FaBrain,
  FaAward,
  FaFire,
  FaUsers,
  FaLink,
  FaDollarSign,
  FaBed,
  FaHeartbeat,
  FaRobot,
} from 'react-icons/fa';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  LineChart,
  Line,
  BarChart,
  Bar,
} from 'recharts';

import GlassCard from '../components/GlassCard';

// Habits
import {
  generateHabitInsights,
  getHabitCorrelations,
  getPredictiveSchedule,
  getProgressForecast,
  getAchievements,
  exportHabitData,
  getUserHabits,
  getMotivationTriggers,
} from '../services/dataStore';

// Wealth
import {
  getWealthData,
  generateFinancialInsights,
  exportWealthData,
} from '../services/wealthStore';

// Sleep
import {
  getSleepData,
  calculateSleepScore,
  exportSleepData,
} from '../services/sleepStore';

// Recovery
import {
  getRecoverySnapshot,
  generateRecoveryInsights,
  exportRecoveryData,
} from '../services/recoveryStore';

export default function Insights() {
  // Colors (hoisted)
  const sub = useColorModeValue('gray.700', 'gray.300');
  const heroFrom = useColorModeValue('brand.500', 'brand.600');
  const heroTo = useColorModeValue('brand.700', 'brand.700');
  const cardBg = useColorModeValue('blackAlpha.50', 'whiteAlpha.100');
  const cardBorder = useColorModeValue('blackAlpha.200', 'whiteAlpha.300');
  const infoBg = useColorModeValue('blue.50', 'blue.900');

  const toast = useToast();

  // ---------- State ----------
  // Habits
  const [insights, setInsights] = useState(null);
  const [correlations, setCorrelations] = useState([]);
  const [predictiveSchedule, setPredictiveSchedule] = useState([]);
  const [forecast, setForecast] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [habits, setHabits] = useState([]);
  const [motivationTriggers, setMotivationTriggers] = useState([]);

  // Wealth
  const [wealth, setWealth] = useState({});
  const [wealthInsights, setWealthInsights] = useState({});

  // Sleep
  const [sleep, setSleep] = useState({});
  const [sleepScore, setSleepScore] = useState(0);

  // Recovery
  const [recovery, setRecovery] = useState({});
  const [recoveryInsights, setRecoveryInsights] = useState({});

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    loadAllInsights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAllInsights = async () => {
    setLoading(true);
    try {
      const [
        habitInsights,
        habitCorrelations,
        schedule,
        progressForecast,
        userAchievements,
        userHabits,
        triggers,

        wData,
        wInsights,

        sData,
        sScore,

        rSnap,
        rInsights,
      ] = await Promise.all([
        // Habits
        generateHabitInsights(),
        getHabitCorrelations(),
        getPredictiveSchedule(),
        getProgressForecast(),
        getAchievements(),
        getUserHabits(),
        getMotivationTriggers(),
        // Wealth
        getWealthData(),
        generateFinancialInsights(),
        // Sleep
        getSleepData(),
        calculateSleepScore(),
        // Recovery
        getRecoverySnapshot(),
        generateRecoveryInsights(),
      ]);

      // Habits
      setInsights(habitInsights || null);
      setCorrelations(habitCorrelations || []);
      setPredictiveSchedule(schedule || []);
      setForecast(progressForecast || null);
      setAchievements(userAchievements || []);
      setHabits(userHabits || []);
      setMotivationTriggers(triggers || []);

      // Wealth
      setWealth(wData || {});
      setWealthInsights(wInsights || {});

      // Sleep
      setSleep(sData || {});
      setSleepScore(sScore || 0);

      // Recovery
      setRecovery(rSnap || {});
      setRecoveryInsights(rInsights || {});
    } catch (error) {
      console.error('Error loading insights:', error);
      toast({
        title: 'Error loading insights',
        status: 'error',
        duration: 3000,
      });
    }
    setLoading(false);
  };

  const handleExport = async (format) => {
    try {
      await exportHabitData(format); // swap to a unified exporter if you add one later
      toast({
        title: `Exported as ${format.toUpperCase()}`,
        description: 'Your insights report has been generated',
        status: 'success',
        duration: 3000,
      });
    } catch {
      toast({ title: 'Export failed', status: 'error' });
    }
  };

  const handlePillarExport = async (pillar, format) => {
    try {
      if (pillar === 'habits') await exportHabitData(format);
      if (pillar === 'wealth') await exportWealthData(format);
      if (pillar === 'sleep') await exportSleepData(format);
      if (pillar === 'recovery') await exportRecoveryData(format);
      toast({
        title: `${pillar[0].toUpperCase() + pillar.slice(1)} exported`,
        description: `Saved as ${format.toUpperCase()}`,
        status: 'success',
      });
    } catch {
      toast({ title: `Export failed for ${pillar}`, status: 'error' });
    }
  };

  // ---------- Derived metrics ----------
  const stats = useMemo(() => getPerformanceStats(habits, forecast), [habits, forecast]);

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
  const recoveryStage = recovery?.pattern?.stage || 'action';

  // ---------- Helpers ----------
  const getWeeklySummary = () => {
    if (!insights) return [];
    return [
      `Peak productivity: ${insights.peakHours}`,
      `Most consistent: ${insights.bestHabits?.join(', ') || 'No habits yet'}`,
      `Weekly completion: ${forecast?.successProbability || 0}% success probability`,
      `Top correlation: ${correlations[0]?.relationship || 'Not enough data'}`,
    ];
  };

  const ensureSeries = (arr, key = 'value') =>
    (Array.isArray(arr) && arr.length
      ? arr
      : [
          { date: 'D-6', [key]: 2 },
          { date: 'D-5', [key]: 3 },
          { date: 'D-4', [key]: 4 },
          { date: 'D-3', [key]: 3 },
          { date: 'D-2', [key]: 5 },
          { date: 'D-1', [key]: 4 },
          { date: 'D-0', [key]: 6 },
        ]);

  return (
    <Box minH="100vh">
      {/* Hero */}
      <Box
        position="relative"
        bgGradient={`linear(to-r, ${heroFrom}, ${heroTo})`}
        color="white"
        px={{ base: 4, md: 8 }}
        py={{ base: 10, md: 14 }}
        borderBottomRadius={{ base: '2xl', md: '3xl' }}
        boxShadow="lux"
        overflow="hidden"
      >
        <Box
          className="floating-decor decorate-blob"
          position="absolute"
          top="-80px"
          left="-60px"
          style={{ width: 380, height: 380, opacity: 0.12 }}
          pointerEvents="none"
          aria-hidden
        />
        <Box
          className="floating-decor decorate-blob"
          position="absolute"
          bottom="-60px"
          right="-20px"
          style={{ width: 260, height: 260, opacity: 0.09 }}
          pointerEvents="none"
          aria-hidden
        />

        <HStack justify="space-between" align="start" flexWrap="wrap" gap={4} maxW="7xl" mx="auto">
          <Box flex="1" minW="240px">
            <Heading size="xl" fontWeight="800" letterSpacing=".3px">
              AI Insights & Analytics
            </Heading>
            <Text mt={2} opacity={0.95}>
              Deep analysis of your habits, wealth, sleep, and recovery trends.
            </Text>
          </Box>
          <HStack spacing={3}>
            <Badge colorScheme="purple" variant="solid" borderRadius="full" px={3}>
              AI Powered
            </Badge>
            <Button
              leftIcon={<RepeatIcon />}
              variant="outline"
              colorScheme="whiteAlpha"
              onClick={loadAllInsights}
              isLoading={loading}
              size="sm"
            >
              Refresh
            </Button>
            <Button
              leftIcon={<DownloadIcon />}
              variant="outline"
              colorScheme="whiteAlpha"
              onClick={() => handleExport('pdf')}
              size="sm"
            >
              Export
            </Button>
          </HStack>
        </HStack>
      </Box>

      {/* Content */}
      <Box px={{ base: 4, md: 8 }} pt={{ base: 6, md: 10 }} pb={{ base: 14, md: 20 }}>
        <Stack spacing={8} maxW="7xl" mx="auto">
          {/* Pillars Overview */}
          <GlassCard title="Pillars Overview">
            <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} spacing={4}>
              {/* Habits */}
              <Card bg={cardBg} border="1px solid" borderColor={cardBorder}>
                <CardBody>
                  <HStack justify="space-between" align="start">
                    <VStack align="start" spacing={1}>
                      <HStack>
                        <Icon as={FaFire} />
                        <Text fontWeight="600">Habits</Text>
                      </HStack>
                      <Text fontSize="sm" color={sub}>
                        {stats.totalHabits} active • Avg streak {stats.avgStreak}d
                      </Text>
                    </VStack>
                    <Button as={RouterLink} to="/habits" size="xs" variant="outline">
                      Open
                    </Button>
                  </HStack>

                  <Box mt={3} minW={0}>
                    <ResponsiveContainer width="100%" height={90}>
                      <AreaChart
                        data={ensureSeries(
                          predictiveSchedule.map((p, i) => ({ date: `T+${i}`, value: p.confidence })) || [],
                          'value'
                        )}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" hide />
                        <YAxis hide />
                        <RTooltip />
                        <Area type="monotone" dataKey="value" stroke="#805AD5" fill="#805AD5" fillOpacity={0.25} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>

                  <HStack mt={3} spacing={2}>
                    <Button as={RouterLink} to="/habits/coach" leftIcon={<FaRobot />} size="xs" colorScheme="purple">
                      Coach
                    </Button>
                    <Badge colorScheme={stats.completionRate > 70 ? 'green' : 'orange'}>
                      {stats.completionRate}% weekly
                    </Badge>
                  </HStack>
                </CardBody>
              </Card>

              {/* Wealth */}
              <Card bg={cardBg} border="1px solid" borderColor={cardBorder}>
                <CardBody>
                  <HStack justify="space-between" align="start">
                    <VStack align="start" spacing={1}>
                      <HStack>
                        <Icon as={FaDollarSign} />
                        <Text fontWeight="600">Wealth</Text>
                      </HStack>
                      <Text fontSize="sm" color={sub}>
                        Net worth ${netWorth.toLocaleString()} • Save {savingsRate.toFixed(0)}%
                      </Text>
                    </VStack>
                    <Button as={RouterLink} to="/wealth" size="xs" variant="outline">
                      Open
                    </Button>
                  </HStack>

                  <Box mt={3} minW={0}>
                    <ResponsiveContainer width="100%" height={90}>
                      <LineChart data={ensureSeries(wealth?.netWorthHistory || [], 'value')}>
                        <XAxis dataKey="date" hide />
                        <YAxis hide />
                        <RTooltip />
                        <Line type="monotone" dataKey="value" stroke="#38A169" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>

                  <HStack mt={3} spacing={2}>
                    <Button as={RouterLink} to="/wealth/advisor" leftIcon={<FaRobot />} size="xs" colorScheme="purple">
                      Advisor
                    </Button>
                    <Badge colorScheme="purple">{wealthInsights?.topOpportunity || 'Balanced'}</Badge>
                  </HStack>
                </CardBody>
              </Card>

              {/* Sleep */}
              <Card bg={cardBg} border="1px solid" borderColor={cardBorder}>
                <CardBody>
                  <HStack justify="space-between" align="start">
                    <VStack align="start" spacing={1}>
                      <HStack>
                        <Icon as={FaBed} />
                        <Text fontWeight="600">Sleep</Text>
                      </HStack>
                      <Text fontSize="sm" color={sub}>
                        Score {sleepScore}/100 • {sleep?.averageDuration || '—'} avg
                      </Text>
                    </VStack>
                    <Button as={RouterLink} to="/sleep" size="xs" variant="outline">
                      Open
                    </Button>
                  </HStack>

                  <Box mt={3} minW={0}>
                    <ResponsiveContainer width="100%" height={90}>
                      <AreaChart data={ensureSeries(sleep?.qualityTrend || [], 'quality')}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" hide />
                        <YAxis domain={[0, 100]} hide />
                        <RTooltip />
                        <Area type="monotone" dataKey="quality" stroke="#805AD5" fill="#805AD5" fillOpacity={0.25} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>

                  <HStack mt={3} spacing={2}>
                    <Button as={RouterLink} to="/sleep/coach" leftIcon={<FaRobot />} size="xs" colorScheme="purple">
                      Coach
                    </Button>
                    <Badge colorScheme="blue">{sleep?.lastNight?.deepSleep || '—'} deep</Badge>
                  </HStack>
                </CardBody>
              </Card>

              {/* Recovery */}
              <Card bg={cardBg} border="1px solid" borderColor={cardBorder}>
                <CardBody>
                  <HStack justify="space-between" align="start">
                    <VStack align="start" spacing={1}>
                      <HStack>
                        <Icon as={FaHeartbeat} />
                        <Text fontWeight="600">Recovery</Text>
                      </HStack>
                      <Text fontSize="sm" color={sub}>
                        {daysSober} days • {recoveryStage}
                      </Text>
                    </VStack>
                    <Button as={RouterLink} to="/recovery" size="xs" variant="outline">
                      Open
                    </Button>
                  </HStack>

                  <Box mt={3} minW={0}>
                    <ResponsiveContainer width="100%" height={90}>
                      <BarChart
                        data={
                          recoveryInsights?.weeklyExposure || [
                            { label: 'Social', value: 3 },
                            { label: 'Stress', value: 4 },
                            { label: 'Evenings', value: 5 },
                          ]
                        }
                      >
                        <XAxis dataKey="label" hide />
                        <YAxis hide />
                        <RTooltip />
                        <Bar dataKey="value" fill="#D69E2E" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>

                  <HStack mt={3} spacing={2}>
                    <Button as={RouterLink} to="/recovery/coach" leftIcon={<FaRobot />} size="xs" colorScheme="purple">
                      Coach
                    </Button>
                    <Badge colorScheme="orange">{(recovery?.risks?.topTriggers || [])[0] || '—'}</Badge>
                  </HStack>
                </CardBody>
              </Card>
            </SimpleGrid>
          </GlassCard>

          {/* KPI row – habits-focused */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            <GlassCard>
              <Stat>
                <StatLabel>Habit Consistency</StatLabel>
                <StatNumber>{stats.completionRate}%</StatNumber>
                <StatHelpText>
                  <StatArrow type={stats.completionRate > 70 ? 'increase' : 'decrease'} />
                  Weekly success rate
                </StatHelpText>
              </Stat>
              <Progress
                value={stats.completionRate}
                colorScheme={stats.completionRate > 70 ? 'green' : 'orange'}
                mt={2}
                borderRadius="full"
              />
            </GlassCard>

            <GlassCard>
              <Stat>
                <StatLabel>Active Habits</StatLabel>
                <StatNumber>{stats.totalHabits}</StatNumber>
                <StatHelpText>
                  <Icon as={FaFire} color="orange.500" />
                  &nbsp;Average streak: {stats.avgStreak} days
                </StatHelpText>
              </Stat>
            </GlassCard>

            <GlassCard>
              <Stat>
                <StatLabel>Achievements</StatLabel>
                <StatNumber>{achievements.length}</StatNumber>
                <StatHelpText>
                  <Icon as={FaAward} color="yellow.500" />
                  &nbsp;Badges unlocked
                </StatHelpText>
              </Stat>
            </GlassCard>
          </SimpleGrid>

          {/* Motivation alert */}
          {motivationTriggers.length > 0 && (
            <Alert status="info" borderRadius="xl" variant="left-accent" bg={infoBg}>
              <AlertIcon />
              <Box flex="1">
                <AlertTitle>Smart Suggestions</AlertTitle>
                <AlertDescription>
                  {motivationTriggers[0].title} — {motivationTriggers[0].condition}
                </AlertDescription>
              </Box>
            </Alert>
          )}

          {/* Tabs */}
          <Tabs variant="enclosed" colorScheme="purple" onChange={setActiveTab}>
            {/* Responsive TabList */}
            <TabList
              flexWrap={{ base: 'wrap', md: 'nowrap' }}
              gap={{ base: 2, md: 0 }}
              overflowX={{ base: 'auto', md: 'visible' }}
              pb={{ base: 2, md: 0 }}
              sx={{
                '::-webkit-scrollbar': { display: 'none' },
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              <Tab
                flex={{ base: '1 1 calc(50% - 8px)', md: '0 0 auto' }}
                minW={{ base: '46%', md: 'auto' }}
                justifyContent="flex-start"
              >
                <HStack spacing={2}>
                  <FaBrain />
                  <Text>AI Analysis</Text>
                </HStack>
              </Tab>
              <Tab
                flex={{ base: '1 1 calc(50% - 8px)', md: '0 0 auto' }}
                minW={{ base: '46%', md: 'auto' }}
                justifyContent="flex-start"
              >
                <HStack spacing={2}>
                  <FaLink />
                  <Text>Correlations</Text>
                </HStack>
              </Tab>
              <Tab
                flex={{ base: '1 1 calc(50% - 8px)', md: '0 0 auto' }}
                minW={{ base: '46%', md: 'auto' }}
                justifyContent="flex-start"
              >
                <HStack spacing={2}>
                  <FaChartLine />
                  <Text>Performance</Text>
                </HStack>
              </Tab>
              <Tab
                flex={{ base: '1 1 calc(50% - 8px)', md: '0 0 auto' }}
                minW={{ base: '46%', md: 'auto' }}
                justifyContent="flex-start"
              >
                <HStack spacing={2}>
                  <FaAward />
                  <Text>Achievements</Text>
                </HStack>
              </Tab>
            </TabList>

            <TabPanels>
              {/* AI Analysis */}
              <TabPanel p={0} pt={6}>
                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                  <GlassCard title="This Week's Summary" colSpan={{ base: 1, lg: 2 }}>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <Stack spacing={3}>
                        {getWeeklySummary().map((line, i) => (
                          <HStack key={i}>
                            <StarIcon color="purple.500" boxSize={3} />
                            <Text color={sub}>{line}</Text>
                          </HStack>
                        ))}
                      </Stack>
                      <Card bg={cardBg} border="1px solid" borderColor={cardBorder}>
                        <CardBody>
                          <VStack spacing={3}>
                            <Text fontWeight="600">Progress Forecast</Text>
                            <Progress
                              value={forecast?.successProbability || 0}
                              colorScheme={forecast?.successProbability > 70 ? 'green' : 'orange'}
                              size="lg"
                              w="100%"
                              borderRadius="full"
                            />
                            <Text fontSize="sm" textAlign="center">
                              {forecast?.successProbability || 0}% chance of maintaining all habits this week
                            </Text>
                            {!!forecast?.riskFactors?.length && (
                              <Alert status="warning" size="sm" borderRadius="md">
                                <AlertIcon />
                                <Box fontSize="xs">
                                  <AlertTitle>Potential risks:</AlertTitle>
                                  <AlertDescription>{forecast.riskFactors.join(', ')}</AlertDescription>
                                </Box>
                              </Alert>
                            )}
                          </VStack>
                        </CardBody>
                      </Card>
                    </SimpleGrid>
                  </GlassCard>

                  <GlassCard title="🕐 Predictive Scheduling">
                    <VStack spacing={3} align="start">
                      <Text fontSize="sm" color={sub}>
                        AI-suggested optimal times based on your patterns
                      </Text>

                      {predictiveSchedule.slice(0, 4).map((s, i) => (
                        <HStack key={i} w="100%" justify="space-between" p={2}>
                          <VStack align="start" spacing={0}>
                            <Text fontWeight="600" fontSize="sm">
                              {s.habit}
                            </Text>
                            <Text fontSize="xs" color="gray.600">
                              {s.time}
                            </Text>
                          </VStack>
                          <Badge colorScheme={s.confidence > 70 ? 'green' : 'orange'} fontSize="xs">
                            {s.confidence}%
                          </Badge>
                        </HStack>
                      ))}

                      {predictiveSchedule.length === 0 && (
                        <Text fontSize="sm" color={sub} fontStyle="italic">
                          Complete more habits to get personalized scheduling
                        </Text>
                      )}
                    </VStack>
                  </GlassCard>

                  <GlassCard title="Live Habit Insights" right={<Badge colorScheme="green">Real-time</Badge>}>
                    {insights ? (
                      <Stack spacing={3}>
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="600">Peak Performance</Text>
                          <Text color={sub}>{insights.peakHours}</Text>
                        </VStack>

                        {!!insights.bestHabits?.length && (
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="600">Most Consistent</Text>
                            <Text color={sub}>{insights.bestHabits.join(', ')}</Text>
                          </VStack>
                        )}

                        <VStack align="start" spacing={2}>
                          <Text fontWeight="600">AI Recommendations</Text>
                          {(insights.recommendations || []).map((r, idx) => (
                            <Text key={idx} color={sub} fontSize="sm">
                              • {r}
                            </Text>
                          ))}
                        </VStack>
                      </Stack>
                    ) : (
                      <Text color={sub}>No insights yet. Start tracking habits to unlock AI analysis.</Text>
                    )}
                  </GlassCard>
                </SimpleGrid>
              </TabPanel>

              {/* Correlations */}
              <TabPanel p={0} pt={6}>
                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                  <GlassCard title="🔗 Habit Correlations" colSpan={{ base: 1, lg: 2 }}>
                    <VStack spacing={4} align="start">
                      <Text fontSize="sm" color={sub}>
                        Discover how your habits influence each other
                      </Text>

                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="100%">
                        {correlations.slice(0, 6).map((c, i) => (
                          <Card key={i} bg={cardBg} border="1px solid" borderColor={cardBorder}>
                            <CardBody>
                              <VStack spacing={2} align="start">
                                <Text fontSize="sm" fontWeight="600">
                                  {c.relationship}
                                </Text>
                                <Progress
                                  value={Math.abs(c.strength) * 100}
                                  colorScheme={
                                    Math.abs(c.strength) > 0.7 ? 'green' : Math.abs(c.strength) > 0.4 ? 'orange' : 'blue'
                                  }
                                  w="100%"
                                  size="sm"
                                  borderRadius="full"
                                />
                                <HStack justify="space-between" w="100%">
                                  <Text fontSize="xs" color={sub}>
                                    {c.strength > 0 ? 'Positive' : 'Negative'} correlation
                                  </Text>
                                  <Badge fontSize="xs">{Math.abs(c.strength * 100).toFixed(0)}%</Badge>
                                </HStack>
                              </VStack>
                            </CardBody>
                          </Card>
                        ))}
                      </SimpleGrid>

                      {correlations.length === 0 && (
                        <Text color={sub} fontStyle="italic">
                          Track multiple habits over time to see correlation patterns
                        </Text>
                      )}
                    </VStack>
                  </GlassCard>

                  <GlassCard title="📈 Pattern Analysis">
                    <VStack spacing={2} align="start" w="100%">
                      <HStack>
                        <Icon as={FaFire} color="green.500" />
                        <Text fontSize="sm">Morning habits have 85% higher completion rate</Text>
                      </HStack>
                      <HStack>
                        <Icon as={FaChartLine} color="blue.500" />
                        <Text fontSize="sm">Weekend consistency is 23% lower than weekdays</Text>
                      </HStack>
                      <HStack>
                        <Icon as={FaUsers} color="purple.500" />
                        <Text fontSize="sm">Exercise days correlate with 40% higher productivity</Text>
                      </HStack>
                    </VStack>
                  </GlassCard>

                  <GlassCard title="💡 Optimization Tips">
                    <Stack spacing={3} color={sub}>
                      <Text fontSize="sm">• Schedule important tasks during your peak focus hours (10–12)</Text>
                      <Text fontSize="sm">• Batch similar activities to reduce context switching</Text>
                      <Text fontSize="sm">• Use the 2-minute rule for quick habit starters</Text>
                      <Text fontSize="sm">• Plan breaks after 90-minute focus sessions</Text>
                      <Text fontSize="sm">• Review your patterns weekly to adjust schedules</Text>
                    </Stack>
                  </GlassCard>
                </SimpleGrid>
              </TabPanel>

              {/* Performance */}
              <TabPanel p={0} pt={6}>
                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                  <GlassCard title="Trend Analysis" colSpan={{ base: 1, lg: 2 }}>
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                      <VStack spacing={3} p={4} bg={cardBg} borderRadius="xl">
                        <Icon as={FaFire} color="orange.500" boxSize={6} />
                        <Text fontWeight="600">Longest Streak</Text>
                        <Text fontSize="2xl" fontWeight="bold">
                          {Math.max(...(habits || []).map((h) => h.streak || 0), 0)} days
                        </Text>
                        <Text fontSize="sm" color={sub} textAlign="center">
                          Your most consistent habit duration
                        </Text>
                      </VStack>

                      <VStack spacing={3} p={4} bg={cardBg} borderRadius="xl">
                        <Icon as={FaChartLine} color="green.500" boxSize={6} />
                        <Text fontWeight="600">Weekly Average</Text>
                        <Text fontSize="2xl" fontWeight="bold">
                          {stats.avgStreak} days
                        </Text>
                        <Text fontSize="sm" color={sub} textAlign="center">
                          Average across all habits
                        </Text>
                      </VStack>

                      <VStack spacing={3} p={4} bg={cardBg} borderRadius="xl">
                        <Icon as={CalendarIcon} color="blue.500" boxSize={6} />
                        <Text fontWeight="600">Best Time</Text>
                        <Text fontSize="2xl" fontWeight="bold">Morning</Text>
                        <Text fontSize="sm" color={sub} textAlign="center">
                          Highest success rate period
                        </Text>
                      </VStack>
                    </SimpleGrid>
                  </GlassCard>

                  <GlassCard title="Next Best Windows" right={<Badge colorScheme="green">Live</Badge>}>
                    <Stack spacing={3}>
                      {predictiveSchedule.slice(0, 3).map((n, index) => (
                        <HStack
                          key={index}
                          justify="space-between"
                          p={3}
                          border="1px solid"
                          borderColor={cardBorder}
                          bg={cardBg}
                          borderRadius="xl"
                        >
                          <VStack align="start" spacing={0}>
                            <Text fontWeight="600">{n.habit}</Text>
                            <Text fontSize="sm" color={sub}>
                              {n.time}
                            </Text>
                          </VStack>
                          <Badge colorScheme={n.confidence > 70 ? 'green' : 'orange'}>{n.confidence}%</Badge>
                        </HStack>
                      ))}
                    </Stack>
                  </GlassCard>

                  <GlassCard title="Areas for Improvement">
                    <VStack spacing={3} align="start">
                      {(forecast?.riskFactors || []).map((risk, i) => (
                        <HStack key={i} spacing={3}>
                          <Icon as={TimeIcon} color="orange.500" />
                          <Text fontSize="sm">{risk}</Text>
                        </HStack>
                      ))}
                      {!(forecast?.riskFactors || []).length && (
                        <Text fontSize="sm" color={sub}>
                          Great job! Keep maintaining your current consistency.
                        </Text>
                      )}
                    </VStack>
                  </GlassCard>
                </SimpleGrid>
              </TabPanel>

              {/* Achievements */}
              <TabPanel p={0} pt={6}>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  {achievements.map((a) => (
                    <GlassCard key={a.id}>
                      <VStack spacing={3} textAlign="center">
                        <Icon as={FaAward} w={8} h={8} color="yellow.500" />
                        <Text fontWeight="bold">{a.title}</Text>
                        <Text fontSize="sm" color={sub}>
                          {a.description}
                        </Text>
                        <Badge colorScheme="green" borderRadius="full">
                          Unlocked {new Date(a.unlockedAt).toLocaleDateString()}
                        </Badge>
                      </VStack>
                    </GlassCard>
                  ))}

                  <GlassCard opacity={0.7}>
                    <VStack spacing={3} textAlign="center">
                      <Icon as={FaAward} w={8} h={8} color="gray.400" />
                      <Text fontWeight="bold" color="gray.500">
                        30-Day Master
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        Maintain a habit for 30 days
                      </Text>
                      <Badge colorScheme="gray" borderRadius="full">
                        Locked
                      </Badge>
                    </VStack>
                  </GlassCard>

                  <GlassCard opacity={0.7}>
                    <VStack spacing={3} textAlign="center">
                      <Icon as={FaUsers} w={8} h={8} color="gray.400" />
                      <Text fontWeight="bold" color="gray.500">
                        Habit Champion
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        Complete all habits for 7 straight days
                      </Text>
                      <Badge colorScheme="gray" borderRadius="full">
                        Locked
                      </Badge>
                    </VStack>
                  </GlassCard>
                </SimpleGrid>
              </TabPanel>
            </TabPanels>
          </Tabs>

          {/* Export Options – per pillar */}
          <GlassCard title="Export Insights">
            <VStack spacing={5} align="start">
              <Text color={sub}>Download insights by pillar for offline review or sharing.</Text>

              <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={4} w="100%">
                {/* Habits */}
                <VStack align="start" spacing={2}>
                  <Badge colorScheme="purple" borderRadius="full">
                    Habits
                  </Badge>
                  <HStack wrap="wrap">
                    <Button size="sm" leftIcon={<DownloadIcon />} onClick={() => handlePillarExport('habits', 'pdf')}>
                      PDF
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<DownloadIcon />}
                      onClick={() => handlePillarExport('habits', 'csv')}
                    >
                      CSV
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<DownloadIcon />}
                      onClick={() => handlePillarExport('habits', 'json')}
                    >
                      JSON
                    </Button>
                  </HStack>
                </VStack>

                {/* Wealth */}
                <VStack align="start" spacing={2}>
                  <Badge colorScheme="green" borderRadius="full">
                    Wealth
                  </Badge>
                  <HStack wrap="wrap">
                    <Button size="sm" leftIcon={<DownloadIcon />} onClick={() => handlePillarExport('wealth', 'pdf')}>
                      PDF
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<DownloadIcon />}
                      onClick={() => handlePillarExport('wealth', 'csv')}
                    >
                      CSV
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<DownloadIcon />}
                      onClick={() => handlePillarExport('wealth', 'json')}
                    >
                      JSON
                    </Button>
                  </HStack>
                </VStack>

                {/* Sleep */}
                <VStack align="start" spacing={2}>
                  <Badge colorScheme="blue" borderRadius="full">
                    Sleep
                  </Badge>
                  <HStack wrap="wrap">
                    <Button size="sm" leftIcon={<DownloadIcon />} onClick={() => handlePillarExport('sleep', 'pdf')}>
                      PDF
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<DownloadIcon />}
                      onClick={() => handlePillarExport('sleep', 'csv')}
                    >
                      CSV
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<DownloadIcon />}
                      onClick={() => handlePillarExport('sleep', 'json')}
                    >
                      JSON
                    </Button>
                  </HStack>
                </VStack>

                {/* Recovery */}
                <VStack align="start" spacing={2}>
                  <Badge colorScheme="orange" borderRadius="full">
                    Recovery
                  </Badge>
                  <HStack wrap="wrap">
                    <Button
                      size="sm"
                      leftIcon={<DownloadIcon />}
                      onClick={() => handlePillarExport('recovery', 'pdf')}
                    >
                      PDF
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<DownloadIcon />}
                      onClick={() => handlePillarExport('recovery', 'csv')}
                    >
                      CSV
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<DownloadIcon />}
                      onClick={() => handlePillarExport('recovery', 'json')}
                    >
                      JSON
                    </Button>
                  </HStack>
                </VStack>
              </SimpleGrid>
            </VStack>
          </GlassCard>
        </Stack>
      </Box>
    </Box>
  );
}

function getPerformanceStats(habits, forecast) {
  const totalHabits = habits?.length || 0;
  const totalStreak = (habits || []).reduce((sum, h) => sum + (h.streak || 0), 0);
  const avgStreak = totalHabits > 0 ? Math.round(totalStreak / totalHabits) : 0;
  const completionRate = forecast?.successProbability || 0;
  return { totalHabits, avgStreak, completionRate };
}
