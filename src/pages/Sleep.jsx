// src/pages/Sleep.jsx
import React, { useState, useEffect } from 'react';
import {
  Box, Heading, Text, SimpleGrid, HStack, Badge, Stack,
  useColorModeValue, Button, VStack, Progress, IconButton,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody,
  ModalCloseButton, useDisclosure, FormControl, FormLabel,
  Input, Select, NumberInput, NumberInputField, Tabs, TabList, TabPanels, Tab, TabPanel,
  useToast, Alert, AlertIcon, AlertTitle, AlertDescription,
  Card, CardBody, Tooltip, Divider, Table, Thead, Tbody, Tr, Th, Td,
  Stat, StatLabel, StatNumber, StatHelpText, StatArrow, Wrap,
  Radio, RadioGroup, Slider, SliderTrack, SliderFilledTrack, SliderThumb
} from '@chakra-ui/react';
import {
  AddIcon, DownloadIcon, EditIcon, DeleteIcon
} from '@chakra-ui/icons';
import {
  FaBed, FaMoon, FaHeartbeat, FaBrain, FaRobot,
  FaChartLine, FaChartPie, FaLightbulb, FaVolumeUp,
  FaThermometerHalf
} from 'react-icons/fa';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

import GlassCard from '../components/GlassCard';
import {
  CartesianGrid, Tooltip as RTooltip, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, LineChart, Line, PieChart, Pie, Cell,
  BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

import {
  getSleepData, saveSleepEntry, generateSleepInsights,
  getAISleepAdvice, calculateSleepScore
} from '../services/sleepStore';

export default function Sleep() {
  // ---- Hooks ----------------------------------------------------------------
  const [sleepData, setSleepData] = useState({});
  const [insights, setInsights] = useState({});
  const [activeTab, setActiveTab] = useState(0);
  const [aiAdvice, setAiAdvice] = useState(null);
  const [sleepScore, setSleepScore] = useState(0);
  const navigate = useNavigate();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [entryType, setEntryType] = useState('manual');
  const toast = useToast();

  // Header colors aligned with Dashboard
  const heroFrom = useColorModeValue('brand.500', 'brand.600');
  const heroTo   = useColorModeValue('brand.700', 'brand.700');
  const subText  = useColorModeValue('gray.700', 'gray.300');
  const chipBg   = useColorModeValue('blackAlpha.50', 'whiteAlpha.100');
  const chipBr   = useColorModeValue('blackAlpha.200', 'whiteAlpha.300');

  useEffect(() => {
    loadSleepData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadSleepData = async () => {
    try {
      const [data, sleepInsights, advice, score] = await Promise.all([
        getSleepData(),
        generateSleepInsights(),
        getAISleepAdvice(),
        calculateSleepScore()
      ]);

      setSleepData(data || {});
      setInsights(sleepInsights || {});
      setAiAdvice(advice || null);
      setSleepScore(score || 0);
    } catch (error) {
      console.error('Error loading sleep data:', error);
    }
  };

  const handleAddSleepEntry = async (entry) => {
    try {
      await saveSleepEntry(entry);
      await loadSleepData();
      toast({ title: 'Sleep entry added!', status: 'success', duration: 2000 });
      onClose();
    } catch (error) {
      toast({ title: 'Error adding sleep entry', status: 'error' });
    }
  };

  const getSleepQualityColor = (quality) => {
    if (quality >= 80) return 'green';
    if (quality >= 60) return 'yellow';
    if (quality >= 40) return 'orange';
    return 'red';
  };

  const getSleepStageColor = (stage) => {
    const colors = {
      deep: 'blue.500',
      light: 'green.500',
      rem: 'purple.500',
      awake: 'red.500'
    };
    return colors[stage] || 'gray.500';
  };

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

        <VStack spacing={4} align="start" maxW="7xl" mx="auto">
          <HStack justify="space-between" w="100%" align="flex-start" flexWrap="wrap" gap={3}>
            <Box minW="240px">
              <Heading size="xl" fontWeight="800" letterSpacing=".3px">
                Sleep Intelligence
              </Heading>
              <Text opacity={0.95}>AI-powered sleep tracking and optimization</Text>
            </Box>
            <Badge colorScheme="purple" variant="solid" borderRadius="full" px={3}>
              <HStack spacing={2}>
                <FaMoon />
                <Text>Sleep Score: {sleepScore}/100</Text>
              </HStack>
            </Badge>
          </HStack>

          {/* Header actions — wrap on mobile */}
          <Wrap spacing={3} shouldWrapChildren>
            <Button
              leftIcon={<AddIcon />}
              onClick={onOpen}
              variant="solid"
              size="sm"
              w={{ base: 'full', sm: 'auto' }}
            >
              Log Sleep
            </Button>

            <Button
              leftIcon={<FaHeartbeat />}
              variant="outline"
              color="white"
              borderColor="whiteAlpha.500"
              size="sm"
              w={{ base: 'full', sm: 'auto' }}
            >
              Health Metrics
            </Button>

            {/* Navigate to the dedicated report page */}
            <Button
              as={RouterLink}
              to="/sleep/report"
              leftIcon={<DownloadIcon />}
              variant="outline"
              color="white"
              borderColor="whiteAlpha.500"
              size="sm"
              w={{ base: 'full', sm: 'auto' }}
            >
              Export Report
            </Button>

            {/* Link to AI Sleep Coach */}
            <Button
              as={RouterLink}
              to="/sleep/coach"
              leftIcon={<FaRobot />}
              variant="outline"
              color="white"
              borderColor="whiteAlpha.500"
              size="sm"
              w={{ base: 'full', sm: 'auto' }}
            >
              AI Sleep Coach
            </Button>

            {/* NEW: Configure Reminders for Sleep */}
            <Button
              onClick={() => navigate('/reminders?type=sleep&title=Bedtime%20Routine')}
              variant="outline"
              color="white"
              borderColor="whiteAlpha.500"
              size="sm"
              w={{ base: 'full', sm: 'auto' }}
            >
              Configure Reminders
            </Button>
          </Wrap>
        </VStack>
      </Box>

      {/* Content */}
      <Box px={{ base: 4, md: 8 }} pt={{ base: 6, md: 10 }} pb={{ base: 14, md: 20 }}>
        <Tabs variant="enclosed" colorScheme="purple" onChange={setActiveTab}>
          {/* Tab list */}
          <TabList
            mb={6}
            flexWrap={{ base: 'wrap', md: 'nowrap' }}
            gap={{ base: 2, md: 0 }}
            overflowX={{ base: 'auto', md: 'visible' }}
            pb={{ base: 2, md: 0 }}
            sx={{ '::-webkit-scrollbar': { display: 'none' }, scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {[
              { icon: FaChartLine, label: 'Dashboard' },
              { icon: FaBed, label: 'Sleep Log' },
              { icon: FaBrain, label: 'Sleep Stages' },
              { icon: FaChartPie, label: 'Analytics' },
              { icon: FaLightbulb, label: 'AI Insights' },
            ].map(({ icon, label }) => (
              <Tab
                key={label}
                flex={{ base: '1 1 calc(50% - 8px)', md: '0 0 auto' }}
                minW={{ base: '46%', md: 'auto' }}
                justifyContent="flex-start"
              >
                <HStack spacing={2}>
                  {React.createElement(icon)}
                  <Text>{label}</Text>
                </HStack>
              </Tab>
            ))}
          </TabList>

          <TabPanels>
            {/* Dashboard Tab */}
            <TabPanel p={0}>
              <SimpleGrid maxW="7xl" mx="auto" columns={{ base: 1, lg: 2, xl: 3 }} spacing={6}>
                {/* Sleep Overview */}
                <GlassCard title="🌙 Sleep Overview" colSpan={{ base: 1, xl: 3 }}>
                  <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
                    <Stat>
                      <StatLabel>Sleep Score</StatLabel>
                      <StatNumber>{sleepScore}/100</StatNumber>
                      <StatHelpText>
                        <StatArrow type={sleepScore > 70 ? 'increase' : 'decrease'} />
                        Overall quality
                      </StatHelpText>
                    </Stat>

                    <Stat>
                      <StatLabel>Avg. Duration</StatLabel>
                      <StatNumber>{sleepData.averageDuration || '7h 30m'}</StatNumber>
                      <StatHelpText>
                        <Progress value={75} colorScheme="blue" size="sm" mt={1} />
                      </StatHelpText>
                    </Stat>

                    <Stat>
                      <StatLabel>Sleep Efficiency</StatLabel>
                      <StatNumber>{sleepData.efficiency || 85}%</StatNumber>
                      <StatHelpText>Time asleep vs in bed</StatHelpText>
                    </Stat>

                    <Stat>
                      <StatLabel>Consistency</StatLabel>
                      <StatNumber>{sleepData.consistency || 78}%</StatNumber>
                      <StatHelpText>
                        <StatArrow type="increase" />
                        Weekly pattern
                      </StatHelpText>
                    </Stat>
                  </SimpleGrid>
                </GlassCard>

                {/* Sleep Quality Trend */}
                <GlassCard title="📈 Sleep Quality Trend" colSpan={{ base: 1, lg: 2 }}>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={sleepData.qualityTrend || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 100]} />
                      <RTooltip />
                      <Line
                        type="monotone"
                        dataKey="quality"
                        stroke="#805AD5"
                        strokeWidth={3}
                        dot={{ fill: '#805AD5', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </GlassCard>

                {/* Last Night's Sleep */}
                <GlassCard title="🛌 Last Night">
                  <VStack spacing={3}>
                    <HStack justify="space-between" w="100%">
                      <Text fontSize="sm">Duration</Text>
                      <Badge colorScheme="blue">
                        {sleepData.lastNight?.duration || '7h 45m'}
                      </Badge>
                    </HStack>
                    <HStack justify="space-between" w="100%">
                      <Text fontSize="sm">Quality</Text>
                      <Badge colorScheme={getSleepQualityColor(sleepData.lastNight?.quality || 0)}>
                        {sleepData.lastNight?.quality || 82}%
                      </Badge>
                    </HStack>
                    <HStack justify="space-between" w="100%">
                      <Text fontSize="sm">Deep Sleep</Text>
                      <Text fontSize="sm" fontWeight="600" color="blue.500">
                        {sleepData.lastNight?.deepSleep || '1h 45m'}
                      </Text>
                    </HStack>
                    <HStack justify="space-between" w="100%">
                      <Text fontSize="sm">REM Sleep</Text>
                      <Text fontSize="sm" fontWeight="600" color="purple.500">
                        {sleepData.lastNight?.remSleep || '1h 30m'}
                      </Text>
                    </HStack>
                    <Divider />
                    <HStack justify="space-between" w="100%">
                      <Text fontWeight="600">Wake-ups</Text>
                      <Badge colorScheme={sleepData.lastNight?.wakeups > 3 ? 'red' : 'green'}>
                        {sleepData.lastNight?.wakeups || 2}
                      </Badge>
                    </HStack>
                  </VStack>
                </GlassCard>

                {/* Sleep Environment */}
                <GlassCard title="🏠 Sleep Environment">
                  <VStack spacing={3} align="start">
                    <HStack justify="space-between" w="100%">
                      <HStack>
                        <FaThermometerHalf color="orange" />
                        <Text fontSize="sm">Room Temperature</Text>
                      </HStack>
                      <Badge colorScheme="orange">
                        {sleepData.environment?.temperature || '68°F'}
                      </Badge>
                    </HStack>

                    <HStack justify="space-between" w="100%">
                      <HStack>
                        <FaVolumeUp color="blue" />
                        <Text fontSize="sm">Noise Level</Text>
                      </HStack>
                      <Badge colorScheme={sleepData.environment?.noise > 50 ? 'red' : 'green'}>
                        {sleepData.environment?.noise || '32'} dB
                      </Badge>
                    </HStack>

                    <HStack justify="space-between" w="100%">
                      <HStack>
                        <FaMoon color="purple" />
                        <Text fontSize="sm">Light Exposure</Text>
                      </HStack>
                      <Badge colorScheme={sleepData.environment?.light > 20 ? 'yellow' : 'purple'}>
                        {sleepData.environment?.light || '15'} lux
                      </Badge>
                    </HStack>

                    <Button size="sm" variant="outline" w="100%">
                      Optimize Environment
                    </Button>
                  </VStack>
                </GlassCard>

                {/* Sleep Stages Distribution */}
                <GlassCard title="🎯 Sleep Stages">
                  <VStack spacing={3}>
                    <ResponsiveContainer width="100%" height={120}>
                      <PieChart>
                        <Pie
                          data={sleepData.stagesDistribution || []}
                          cx="50%"
                          cy="50%"
                          innerRadius={30}
                          outerRadius={50}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {(sleepData.stagesDistribution || []).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getSleepStageColor(entry.name)} />
                          ))}
                        </Pie>
                        <RTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <SimpleGrid columns={2} spacing={2} w="100%">
                      {(sleepData.stagesDistribution || []).map((stage) => (
                        <HStack key={stage.name} spacing={1}>
                          <Box w="2" h="2" borderRadius="full" bg={getSleepStageColor(stage.name)} />
                          <Text fontSize="xs">{stage.name}</Text>
                          <Text fontSize="xs" fontWeight="600">{stage.value}</Text>
                        </HStack>
                      ))}
                    </SimpleGrid>
                  </VStack>
                </GlassCard>

                {/* Sleep Recommendations */}
                <GlassCard title="💡 Quick Tips">
                  <VStack spacing={2} align="start">
                    {insights.quickTips?.map((tip, index) => (
                      <HStack key={index} w="100%" p={2} bg={chipBg} borderRadius="md">
                        <FaLightbulb color="orange" />
                        <Text fontSize="sm">{tip}</Text>
                      </HStack>
                    ))}
                    {/* Navigate to the full recommendations page */}
                    <Button
                      as={RouterLink}
                      to="/sleep/recommendations"
                      size="sm"
                      variant="ghost"
                      w="100%"
                    >
                      View All Recommendations
                    </Button>
                  </VStack>
                </GlassCard>
              </SimpleGrid>
            </TabPanel>

            {/* Sleep Log Tab */}
            <TabPanel p={0}>
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                <GlassCard title="Sleep History" colSpan={{ base: 1, lg: 2 }}>
                  <Box w="100%" overflowX={{ base: 'auto', md: 'visible' }}>
                    <Table variant="simple" size={{ base: 'sm', md: 'md' }} minW={{ base: '720px', md: 'unset' }}>
                      <Thead>
                        <Tr>
                          <Th>Date</Th>
                          <Th>Duration</Th>
                          <Th>Quality</Th>
                          <Th>Deep Sleep</Th>
                          <Th>REM Sleep</Th>
                          <Th>Actions</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {(sleepData.sleepHistory || []).map((entry, index) => (
                          <Tr key={index}>
                            <Td>{entry.date}</Td>
                            <Td>{entry.duration}</Td>
                            <Td>
                              <Badge colorScheme={getSleepQualityColor(entry.quality)}>
                                {entry.quality}%
                              </Badge>
                            </Td>
                            <Td>{entry.deepSleep}</Td>
                            <Td>{entry.remSleep}</Td>
                            <Td>
                              <HStack spacing={2}>
                                <IconButton size="sm" icon={<EditIcon />} aria-label="Edit" />
                                <IconButton size="sm" icon={<DeleteIcon />} aria-label="Delete" />
                              </HStack>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                </GlassCard>

                <GlassCard title="Sleep Notes">
                  <VStack spacing={3} align="start">
                    {(sleepData.notes || []).map((note, index) => (
                      <Card key={index} w="100%" variant="outline">
                        <CardBody>
                          <VStack align="start" spacing={2}>
                            <Text fontSize="sm" fontWeight="600">{note.date}</Text>
                            <Text fontSize="sm">{note.content}</Text>
                            <Badge colorScheme="purple" size="sm">
                              {note.mood}
                            </Badge>
                          </VStack>
                        </CardBody>
                      </Card>
                    ))}
                    <Button size="sm" variant="ghost" w="100%" onClick={onOpen}>
                      Add Sleep Note
                    </Button>
                  </VStack>
                </GlassCard>
              </SimpleGrid>
            </TabPanel>

            {/* Sleep Stages Tab */}
            <TabPanel p={0}>
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                <GlassCard title="Sleep Architecture" colSpan={{ base: 1, lg: 2 }}>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={sleepData.sleepArchitecture || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <RTooltip />
                      <Area type="monotone" dataKey="deep" stackId="1" stroke="#3182CE" fill="#3182CE" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="light" stackId="1" stroke="#38A169" fill="#38A169" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="rem" stackId="1" stroke="#805AD5" fill="#805AD5" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="awake" stackId="1" stroke="#E53E3E" fill="#E53E3E" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </GlassCard>

                <GlassCard title="Sleep Stages Radar">
                  <ResponsiveContainer width="100%" height={250}>
                    <RadarChart data={sleepData.stagesRadar || []}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis />
                      <Radar name="Your Sleep" dataKey="A" stroke="#805AD5" fill="#805AD5" fillOpacity={0.6} />
                      <Radar name="Ideal" dataKey="B" stroke="#38A169" fill="#38A169" fillOpacity={0.2} />
                      <RTooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </GlassCard>

                <GlassCard title="Stage Analysis">
                  <VStack spacing={4} align="start">
                    {(sleepData.stageAnalysis || []).map((stage, index) => (
                      <Box key={index} w="100%">
                        <HStack justify="space-between" mb={1}>
                          <Text fontWeight="600" color={getSleepStageColor(stage.name)}>
                            {stage.name} Sleep
                          </Text>
                          <Text fontSize="sm">{stage.duration}</Text>
                        </HStack>
                        <Progress
                          value={stage.percentage}
                          colorScheme={getSleepQualityColor(stage.percentage).replace('.500', '')}
                          size="sm"
                          borderRadius="full"
                        />
                        <Text fontSize="xs" color={subText} mt={1}>
                          {stage.analysis}
                        </Text>
                      </Box>
                    ))}
                  </VStack>
                </GlassCard>
              </SimpleGrid>
            </TabPanel>

            {/* Analytics Tab */}
            <TabPanel p={0}>
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                <GlassCard title="Sleep Patterns" colSpan={{ base: 1, lg: 2 }}>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={sleepData.weeklyPatterns || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <RTooltip />
                      <Bar dataKey="duration" fill="#805AD5" name="Sleep Duration" />
                      <Bar dataKey="quality" fill="#38A169" name="Sleep Quality" />
                    </BarChart>
                  </ResponsiveContainer>
                </GlassCard>

                <GlassCard title="Sleep Consistency">
                  <VStack spacing={4}>
                    <Progress
                      value={sleepData.consistency || 78}
                      colorScheme={sleepData.consistency > 80 ? 'green' : sleepData.consistency > 60 ? 'yellow' : 'red'}
                      size="lg"
                      w="100%"
                      borderRadius="full"
                    />
                    <Text fontSize="2xl" fontWeight="bold">
                      {sleepData.consistency || 78}%
                    </Text>
                    <Text fontSize="sm" color={subText} textAlign="center">
                      Consistency in bed and wake times
                    </Text>
                    <VStack spacing={2} w="100%">
                      <HStack justify="space-between" w="100%">
                        <Text fontSize="sm">Bed Time Consistency</Text>
                        <Badge colorScheme="blue">85%</Badge>
                      </HStack>
                      <HStack justify="space-between" w="100%">
                        <Text fontSize="sm">Wake Time Consistency</Text>
                        <Badge colorScheme="green">72%</Badge>
                      </HStack>
                    </VStack>
                  </VStack>
                </GlassCard>

                <GlassCard title="Environmental Factors">
                  <VStack spacing={3} align="start">
                    <Box w="100%">
                      <Text fontSize="sm" mb={2}>Noise Impact</Text>
                      <Progress value={65} colorScheme="red" size="sm" borderRadius="full" />
                      <Text fontSize="xs" color={subText}>High noise reduces quality by 23%</Text>
                    </Box>
                    <Box w="100%">
                      <Text fontSize="sm" mb={2}>Temperature Impact</Text>
                      <Progress value={80} colorScheme="green" size="sm" borderRadius="full" />
                      <Text fontSize="xs" color={subText}>Optimal temperature maintained</Text>
                    </Box>
                    <Box w="100%">
                      <Text fontSize="sm" mb={2}>Light Exposure</Text>
                      <Progress value={45} colorScheme="yellow" size="sm" borderRadius="full" />
                      <Text fontSize="xs" color={subText}>Moderate light control needed</Text>
                    </Box>
                  </VStack>
                </GlassCard>
              </SimpleGrid>
            </TabPanel>

            {/* AI Insights Tab */}
            <TabPanel p={0}>
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                <GlassCard title="🤖 AI Sleep Coach" colSpan={{ base: 1, lg: 2 }}>
                  <VStack spacing={4} align="start">
                    {(aiAdvice?.recommendations || []).map((rec, index) => (
                      <Alert
                        key={index}
                        status={rec.priority === 'high' ? 'warning' : 'info'}
                        borderRadius="md"
                        variant="left-accent"
                      >
                        <AlertIcon />
                        <Box>
                          <AlertTitle>{rec.title}</AlertTitle>
                          <AlertDescription fontSize="sm">
                            {rec.description}
                          </AlertDescription>
                        </Box>
                      </Alert>
                    ))}

                    <Button leftIcon={<FaRobot />} as={RouterLink} to="/sleep/coach" colorScheme="purple">
                      Get Personalized Sleep Plan
                    </Button>
                  </VStack>
                </GlassCard>

                <GlassCard title="Sleep Disorder Screening">
                  <VStack spacing={3} align="start">
                    {(insights.disorderRisks || []).map((risk, index) => (
                      <HStack key={index} w="100%" justify="space-between" p={3} bg={chipBg} borderRadius="md">
                        <Box>
                          <Text fontSize="sm" fontWeight="600">{risk.condition}</Text>
                          <Text fontSize="xs" color={subText}>{risk.symptoms}</Text>
                        </Box>
                        <Badge colorScheme={risk.risk === 'high' ? 'red' : risk.risk === 'medium' ? 'yellow' : 'green'}>
                          {risk.risk}
                        </Badge>
                      </HStack>
                    ))}
                    <Text fontSize="xs" color={subText} textAlign="center" w="100%">
                      *Consult a healthcare professional for diagnosis
                    </Text>
                  </VStack>
                </GlassCard>

                <GlassCard title="Improvement Timeline">
                  <VStack spacing={3} align="start">
                    {(insights.improvementPlan || []).map((step, index) => (
                      <HStack key={index} w="100%">
                        <Badge colorScheme="purple" borderRadius="full" w={6} h={6} display="flex" alignItems="center" justifyContent="center">
                          {index + 1}
                        </Badge>
                        <Box>
                          <Text fontSize="sm" fontWeight="600">{step.week}</Text>
                          <Text fontSize="xs" color={subText}>{step.action}</Text>
                        </Box>
                      </HStack>
                    ))}
                  </VStack>
                </GlassCard>
              </SimpleGrid>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>

      {/* Sticky Coach Pill (bottom-right) */}
      <Box position="fixed" right={{ base: 3, md: 6 }} bottom={{ base: 3, md: 6 }} zIndex={20}>
        <Tooltip label="Open AI Sleep Coach" hasArrow>
          <Button
            as={RouterLink}
            to="/sleep/coach"
            leftIcon={<FaRobot />}
            colorScheme="purple"
            size="md"
            borderRadius="full"
            boxShadow="lg"
          >
            Coach
          </Button>
        </Tooltip>
      </Box>

      {/* Add Sleep Entry Modal */}
      <AddSleepEntryModal
        isOpen={isOpen}
        onClose={onClose}
        onAddSleepEntry={handleAddSleepEntry}
        entryType={entryType}
        setEntryType={setEntryType}
      />
    </Box>
  );
}

// Add Sleep Entry Modal Component
function AddSleepEntryModal({ isOpen, onClose, onAddSleepEntry, entryType, setEntryType }) {
  const [sleepEntry, setSleepEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    bedtime: '22:30',
    waketime: '06:30',
    quality: 75,
    deepSleep: '1h 45m',
    remSleep: '1h 30m',
    wakeups: 2,
    notes: '',
    mood: 'rested'
  });

  const handleSubmit = () => {
    onAddSleepEntry(sleepEntry);
    setSleepEntry({
      date: new Date().toISOString().split('T')[0],
      bedtime: '22:30',
      waketime: '06:30',
      quality: 75,
      deepSleep: '1h 45m',
      remSleep: '1h 30m',
      wakeups: 2,
      notes: '',
      mood: 'rested'
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Log Sleep Entry</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Entry Type</FormLabel>
              <RadioGroup value={entryType} onChange={setEntryType}>
                <HStack spacing={4}>
                  <Radio value="manual">Manual Entry</Radio>
                  <Radio value="device">Wearable Device</Radio>
                  <Radio value="app">Sleep App</Radio>
                </HStack>
              </RadioGroup>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Date</FormLabel>
              <Input
                type="date"
                value={sleepEntry.date}
                onChange={(e) => setSleepEntry({ ...sleepEntry, date: e.target.value })}
              />
            </FormControl>

            <SimpleGrid columns={2} spacing={4} w="100%">
              <FormControl>
                <FormLabel>Bed Time</FormLabel>
                <Input
                  type="time"
                  value={sleepEntry.bedtime}
                  onChange={(e) => setSleepEntry({ ...sleepEntry, bedtime: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Wake Time</FormLabel>
                <Input
                  type="time"
                  value={sleepEntry.waketime}
                  onChange={(e) => setSleepEntry({ ...sleepEntry, waketime: e.target.value })}
                />
              </FormControl>
            </SimpleGrid>

            <FormControl>
              <FormLabel>Sleep Quality: {sleepEntry.quality}%</FormLabel>
              <Slider
                value={sleepEntry.quality}
                onChange={(value) => setSleepEntry({ ...sleepEntry, quality: value })}
                min={0}
                max={100}
                step={5}
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
            </FormControl>

            <SimpleGrid columns={2} spacing={4} w="100%">
              <FormControl>
                <FormLabel>Deep Sleep</FormLabel>
                <Input
                  placeholder="1h 45m"
                  value={sleepEntry.deepSleep}
                  onChange={(e) => setSleepEntry({ ...sleepEntry, deepSleep: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>REM Sleep</FormLabel>
                <Input
                  placeholder="1h 30m"
                  value={sleepEntry.remSleep}
                  onChange={(e) => setSleepEntry({ ...sleepEntry, remSleep: e.target.value })}
                />
              </FormControl>
            </SimpleGrid>

            <FormControl>
              <FormLabel>Number of Wake-ups</FormLabel>
              <NumberInput min={0} max={20} value={sleepEntry.wakeups}>
                <NumberInputField
                  onChange={(e) => setSleepEntry({ ...sleepEntry, wakeups: parseInt(e.target.value) || 0 })}
                />
              </NumberInput>
            </FormControl>

            <FormControl>
              <FormLabel>Mood</FormLabel>
              <Select
                value={sleepEntry.mood}
                onChange={(e) => setSleepEntry({ ...sleepEntry, mood: e.target.value })}
              >
                <option value="rested">Well Rested</option>
                <option value="tired">Tired</option>
                <option value="exhausted">Exhausted</option>
                <option value="refreshed">Refreshed</option>
                <option value="groggy">Groggy</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Notes</FormLabel>
              <Input
                placeholder="Any observations about your sleep..."
                value={sleepEntry.notes}
                onChange={(e) => setSleepEntry({ ...sleepEntry, notes: e.target.value })}
              />
            </FormControl>

            <Button colorScheme="purple" w="100%" onClick={handleSubmit}>
              Save Sleep Entry
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
