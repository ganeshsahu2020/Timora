import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Stack,
  HStack,
  Badge,
  Button,
  Switch,
  Divider,
  useColorModeValue,
  VStack,
  SimpleGrid,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Select,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Icon,
  Progress,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { DownloadIcon, DeleteIcon, BellIcon, LockIcon, CalendarIcon } from '@chakra-ui/icons';
import { FaGoogle, FaMicrosoft, FaSync, FaUniversity, FaWallet, FaApple } from 'react-icons/fa';

import GlassCard from '../components/GlassCard';
import { clearAllData, exportHabitData, getStoreStats } from '../services/dataStore';
import { exportWealthData } from '../services/wealthStore';
import { exportSleepData } from '../services/sleepStore';
import { exportRecoveryData } from '../services/recoveryStore';

export default function Settings() {
  // Calendar connections
  const [google, setGoogle] = useState(true);
  const [outlook, setOutlook] = useState(false);

  // Finance connections
  const [bankLinked, setBankLinked] = useState(false);
  const [brokerLinked, setBrokerLinked] = useState(false);

  // Sleep/Health devices
  const [fitbit, setFitbit] = useState(false);
  const [oura, setOura] = useState(false);
  const [appleHealth, setAppleHealth] = useState(false);

  // Recovery / safety
  const [supportCircle, setSupportCircle] = useState(true);

  const [notifications, setNotifications] = useState({
    reminders: true,
    achievements: true,
    challenges: true,
    social: false,
    weeklyReports: true,
  });
  const [privacy, setPrivacy] = useState({
    shareProgress: false,
    showInRankings: true,
    dataCollection: true,
    personalizedAds: false,
  });

  const [storeStats, setStoreStats] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [activeTab, setActiveTab] = useState(0);

  const heroFrom = useColorModeValue('brand.500', 'brand.600');
  const heroTo = useColorModeValue('brand.700', 'brand.700');
  const subText = useColorModeValue('gray.700', 'gray.300');
  const chipBg = useColorModeValue('blackAlpha.50', 'whiteAlpha.100');
  const chipBr = useColorModeValue('blackAlpha.200', 'whiteAlpha.300');

  const toast = useToast();

  useEffect(() => {
    const stats = getStoreStats();
    setStoreStats(stats);
  }, []);

  const handleNotificationToggle = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
    toast({ title: 'Settings updated', status: 'success', duration: 2000 });
  };

  const handlePrivacyToggle = (key) => {
    setPrivacy((prev) => ({ ...prev, [key]: !prev[key] }));
    toast({ title: 'Privacy settings updated', status: 'success', duration: 2000 });
  };

  const handleDeleteAllData = () => {
    clearAllData();
    toast({
      title: 'All data deleted',
      description: 'Your habits and progress have been reset',
      status: 'info',
      duration: 4000,
    });
    const stats = getStoreStats();
    setStoreStats(stats);
    onClose();
  };

  // Sync stubs
  const handleCalendarSync = () => toast({ title: 'Calendar sync initiated', status: 'info' });
  const handleFinanceSync = () => toast({ title: 'Finance sync initiated', status: 'info' });
  const handleDeviceSync = () => toast({ title: 'Device sync initiated', status: 'info' });

  // Exports
  const handleExport = async (format) => {
    try {
      await exportHabitData(format);
      toast({
        title: `Exported as ${format.toUpperCase()}`,
        description: 'Habits data downloaded',
        status: 'success',
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
      toast({ title: `${pillar} exported`, description: format.toUpperCase(), status: 'success' });
    } catch {
      toast({ title: `Export failed for ${pillar}`, status: 'error' });
    }
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
        <Box
          className="floating-decor decorate-blob"
          position="absolute"
          bottom="-60px"
          right="-20px"
          style={{ width: 240, height: 240, opacity: 0.08 }}
          pointerEvents="none"
          aria-hidden
        />

        <HStack justify="space-between" align="start" flexWrap="wrap" gap={4} maxW="6xl" mx="auto">
          <Box flex="1" minW="240px">
            <Heading size="xl" fontWeight="800" letterSpacing=".3px">
              Settings & Preferences
            </Heading>
            <Text mt={2} opacity={0.95}>
              Manage connections, notifications, privacy, and data across all pillars.
            </Text>
          </Box>
          <HStack>
            <Badge colorScheme="blackAlpha" bg="whiteAlpha.300" px={3} borderRadius="full">
              {(storeStats?.totalHabits ?? 0)} Habits
            </Badge>
            <Button variant="outline" colorScheme="whiteAlpha" size="sm">
              Help
            </Button>
          </HStack>
        </HStack>
      </Box>

      {/* Content */}
      <Box px={{ base: 4, md: 8 }} pt={{ base: 6, md: 10 }} pb={{ base: 14, md: 20 }}>
        <Stack spacing={8} maxW="6xl" mx="auto">
          {/* Data Overview */}
          {storeStats && (
            <GlassCard title="Data Overview">
              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                <VStack spacing={1} textAlign="center">
                  <Text fontSize="2xl" fontWeight="bold" color="brand.500">
                    {storeStats.totalHabits}
                  </Text>
                  <Text fontSize="sm" color={subText}>
                    Active Habits
                  </Text>
                </VStack>
                <VStack spacing={1} textAlign="center">
                  <Text fontSize="2xl" fontWeight="bold" color="green.500">
                    {storeStats.totalEntries}
                  </Text>
                  <Text fontSize="sm" color={subText}>
                    Total Entries
                  </Text>
                </VStack>
                <VStack spacing={1} textAlign="center">
                  <Text fontSize="2xl" fontWeight="bold" color="yellow.500">
                    {storeStats.totalAchievements}
                  </Text>
                  <Text fontSize="sm" color={subText}>
                    Achievements
                  </Text>
                </VStack>
                <VStack spacing={1} textAlign="center">
                  <Text fontSize="sm" fontWeight="bold" color={subText}>
                    {new Date(storeStats.lastUpdated).toLocaleDateString()}
                  </Text>
                  <Text fontSize="sm" color={subText}>
                    Last Updated
                  </Text>
                </VStack>
              </SimpleGrid>
            </GlassCard>
          )}

          {/* MAIN TABS */}
          <Tabs variant="enclosed" colorScheme="purple" onChange={setActiveTab}>
            <TabList
              flexWrap={{ base: 'wrap', md: 'nowrap' }}
              gap={{ base: 2, md: 0 }}
              overflowX={{ base: 'auto', md: 'visible' }}
              pb={{ base: 2, md: 0 }}
              sx={{ '::-webkit-scrollbar': { display: 'none' }, scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <Tab minW={{ base: '46%', md: 'auto' }}>
                <HStack spacing={2}>
                  <CalendarIcon />
                  <Text>Calendar</Text>
                </HStack>
              </Tab>
              <Tab minW={{ base: '46%', md: 'auto' }}>
                <HStack spacing={2}>
                  <Icon as={FaUniversity} />
                  <Text>Finance</Text>
                </HStack>
              </Tab>
              <Tab minW={{ base: '46%', md: 'auto' }}>
                <HStack spacing={2}>
                  <Icon as={FaApple} />
                  <Text>Devices</Text>
                </HStack>
              </Tab>
              <Tab minW={{ base: '46%', md: 'auto' }}>
                <HStack spacing={2}>
                  <Icon as={FaWallet} />
                  <Text>Recovery</Text>
                </HStack>
              </Tab>
              <Tab minW={{ base: '46%', md: 'auto' }}>
                <HStack spacing={2}>
                  <BellIcon />
                  <Text>Notifications</Text>
                </HStack>
              </Tab>
              <Tab minW={{ base: '46%', md: 'auto' }}>
                <HStack spacing={2}>
                  <LockIcon />
                  <Text>Privacy</Text>
                </HStack>
              </Tab>
              <Tab minW={{ base: '46%', md: 'auto' }}>
                <HStack spacing={2}>
                  <DownloadIcon />
                  <Text>Data</Text>
                </HStack>
              </Tab>
            </TabList>

            <TabPanels>
              {/* Calendar */}
              <TabPanel p={0} pt={6}>
                <Stack spacing={6}>
                  <GlassCard
                    title="Calendar Connections"
                    right={
                      <Wrap spacing={2}>
                        <WrapItem>
                          <Badge variant="outline" borderColor={chipBr} bg={chipBg} color={subText}>
                            {google ? 'Google connected' : 'Google not linked'}
                          </Badge>
                        </WrapItem>
                        <WrapItem>
                          <Badge variant="outline" borderColor={chipBr} bg={chipBg} color={subText}>
                            {outlook ? 'Outlook connected' : 'Outlook not linked'}
                          </Badge>
                        </WrapItem>
                      </Wrap>
                    }
                  >
                    <Stack spacing={4}>
                      <Stack
                        direction={{ base: 'column', md: 'row' }}
                        justify="space-between"
                        align={{ base: 'stretch', md: 'center' }}
                        p={3}
                        bg={chipBg}
                        borderRadius="xl"
                        spacing={3}
                      >
                        <HStack spacing={3} align="flex-start">
                          <Icon as={FaGoogle} color="red.500" boxSize={5} />
                          <Box>
                            <Heading size="sm">Google Calendar</Heading>
                            <Text fontSize="sm" color={subText}>
                              Sync events and let AI find your best focus windows.
                            </Text>
                          </Box>
                        </HStack>
                        <HStack>
                          <Badge colorScheme={google ? 'green' : 'gray'}>{google ? 'Connected' : 'Not linked'}</Badge>
                          <Switch isChecked={google} onChange={(e) => setGoogle(e.target.checked)} />
                        </HStack>
                      </Stack>

                      <Divider />

                      <Stack
                        direction={{ base: 'column', md: 'row' }}
                        justify="space-between"
                        align={{ base: 'stretch', md: 'center' }}
                        p={3}
                        bg={chipBg}
                        borderRadius="xl"
                        spacing={3}
                      >
                        <HStack spacing={3} align="flex-start">
                          <Icon as={FaMicrosoft} color="blue.500" boxSize={5} />
                          <Box>
                            <Heading size="sm">Microsoft Outlook</Heading>
                            <Text fontSize="sm" color={subText}>
                              Works with Microsoft 365 and personal Outlook accounts.
                            </Text>
                          </Box>
                        </HStack>
                        <HStack>
                          <Badge colorScheme={outlook ? 'green' : 'gray'}>{outlook ? 'Connected' : 'Not linked'}</Badge>
                          <Switch isChecked={outlook} onChange={(e) => setOutlook(e.target.checked)} />
                        </HStack>
                      </Stack>

                      <Button
                        leftIcon={<FaSync />}
                        size="lg"
                        colorScheme="purple"
                        isDisabled={!google && !outlook}
                        onClick={handleCalendarSync}
                        w={{ base: 'full', md: 'auto' }}
                      >
                        Authorize & Sync Calendars
                      </Button>
                    </Stack>
                  </GlassCard>
                </Stack>
              </TabPanel>

              {/* Finance */}
              <TabPanel p={0} pt={6}>
                <Stack spacing={6}>
                  <GlassCard
                    title="Finance Connections"
                    right={
                      <Wrap spacing={2}>
                        <WrapItem>
                          <Badge variant="outline" borderColor={chipBr} bg={chipBg} color={subText}>
                            {bankLinked ? 'Bank linked' : 'Bank not linked'}
                          </Badge>
                        </WrapItem>
                        <WrapItem>
                          <Badge variant="outline" borderColor={chipBr} bg={chipBg} color={subText}>
                            {brokerLinked ? 'Broker linked' : 'Broker not linked'}
                          </Badge>
                        </WrapItem>
                      </Wrap>
                    }
                  >
                    <Stack spacing={4}>
                      <Stack
                        direction={{ base: 'column', md: 'row' }}
                        justify="space-between"
                        align={{ base: 'stretch', md: 'center' }}
                        p={3}
                        bg={chipBg}
                        borderRadius="xl"
                        spacing={3}
                      >
                        <HStack spacing={3} align="flex-start">
                          <Icon as={FaUniversity} color="green.500" boxSize={5} />
                          <Box>
                            <Heading size="sm">Bank Accounts</Heading>
                            <Text fontSize="sm" color={subText}>
                              Connect checking/savings for spending & savings insights.
                            </Text>
                          </Box>
                        </HStack>
                        <HStack>
                          <Badge colorScheme={bankLinked ? 'green' : 'gray'}>{bankLinked ? 'Linked' : 'Not linked'}</Badge>
                          <Switch isChecked={bankLinked} onChange={(e) => setBankLinked(e.target.checked)} />
                        </HStack>
                      </Stack>

                      <Stack
                        direction={{ base: 'column', md: 'row' }}
                        justify="space-between"
                        align={{ base: 'stretch', md: 'center' }}
                        p={3}
                        bg={chipBg}
                        borderRadius="xl"
                        spacing={3}
                      >
                        <HStack spacing={3} align="flex-start">
                          <Icon as={FaWallet} color="purple.500" boxSize={5} />
                          <Box>
                            <Heading size="sm">Brokerage</Heading>
                            <Text fontSize="sm" color={subText}>
                              Track investments to power net worth & allocation charts.
                            </Text>
                          </Box>
                        </HStack>
                        <HStack>
                          <Badge colorScheme={brokerLinked ? 'green' : 'gray'}>{brokerLinked ? 'Linked' : 'Not linked'}</Badge>
                          <Switch isChecked={brokerLinked} onChange={(e) => setBrokerLinked(e.target.checked)} />
                        </HStack>
                      </Stack>

                      <Button
                        leftIcon={<FaSync />}
                        size="lg"
                        colorScheme="purple"
                        isDisabled={!bankLinked && !brokerLinked}
                        onClick={handleFinanceSync}
                        w={{ base: 'full', md: 'auto' }}
                      >
                        Authorize & Sync Finances
                      </Button>
                    </Stack>
                  </GlassCard>
                </Stack>
              </TabPanel>

              {/* Devices */}
              <TabPanel p={0} pt={6}>
                <Stack spacing={6}>
                  <GlassCard
                    title="Sleep & Health Devices"
                    right={
                      <Wrap spacing={2}>
                        <WrapItem>
                          <Badge variant="outline" borderColor={chipBr} bg={chipBg} color={subText}>
                            {appleHealth ? 'Apple Health on' : 'Apple Health off'}
                          </Badge>
                        </WrapItem>
                        <WrapItem>
                          <Badge variant="outline" borderColor={chipBr} bg={chipBg} color={subText}>
                            {(fitbit || oura) ? 'Wearable connected' : 'No wearable'}
                          </Badge>
                        </WrapItem>
                      </Wrap>
                    }
                  >
                    <Stack spacing={4}>
                      <Stack
                        direction={{ base: 'column', md: 'row' }}
                        justify="space-between"
                        align={{ base: 'stretch', md: 'center' }}
                        p={3}
                        bg={chipBg}
                        borderRadius="xl"
                        spacing={3}
                      >
                        <HStack spacing={3} align="flex-start">
                          <Icon as={FaApple} color="gray.100" boxSize={5} />
                          <Box>
                            <Heading size="sm">Apple Health</Heading>
                            <Text fontSize="sm" color={subText}>
                              Pull sleep stages and HRV when available.
                            </Text>
                          </Box>
                        </HStack>
                        <HStack>
                          <Badge colorScheme={appleHealth ? 'green' : 'gray'}>{appleHealth ? 'Enabled' : 'Disabled'}</Badge>
                          <Switch isChecked={appleHealth} onChange={(e) => setAppleHealth(e.target.checked)} />
                        </HStack>
                      </Stack>

                      <Stack
                        direction={{ base: 'column', md: 'row' }}
                        justify="space-between"
                        align={{ base: 'stretch', md: 'center' }}
                        p={3}
                        bg={chipBg}
                        borderRadius="xl"
                        spacing={3}
                      >
                        <HStack spacing={3} align="flex-start">
                          <Box>
                            <Heading size="sm">Wearables</Heading>
                            <Text fontSize="sm" color={subText}>
                              Connect Fitbit or Oura for automatic sleep tracking.
                            </Text>
                          </Box>
                        </HStack>
                        <HStack spacing={6}>
                          <HStack>
                            <Badge colorScheme={fitbit ? 'green' : 'gray'}>{fitbit ? 'Fitbit on' : 'Fitbit off'}</Badge>
                            <Switch isChecked={fitbit} onChange={(e) => setFitbit(e.target.checked)} />
                          </HStack>
                          <HStack>
                            <Badge colorScheme={oura ? 'green' : 'gray'}>{oura ? 'Oura on' : 'Oura off'}</Badge>
                            <Switch isChecked={oura} onChange={(e) => setOura(e.target.checked)} />
                          </HStack>
                        </HStack>
                      </Stack>

                      <Button
                        leftIcon={<FaSync />}
                        size="lg"
                        colorScheme="purple"
                        isDisabled={!appleHealth && !fitbit && !oura}
                        onClick={handleDeviceSync}
                        w={{ base: 'full', md: 'auto' }}
                      >
                        Authorize & Sync Devices
                      </Button>
                    </Stack>
                  </GlassCard>
                </Stack>
              </TabPanel>

              {/* Recovery */}
              <TabPanel p={0} pt={6}>
                <Stack spacing={6}>
                  <GlassCard title="Recovery Support & Safety">
                    <VStack spacing={4} align="start">
                      <Text fontSize="sm" color={subText}>
                        Configure support-circle check-ins and proactive alerts for high-risk windows.
                      </Text>

                      <HStack justify="space-between" w="100%" p={3} bg={chipBg} borderRadius="xl">
                        <Box>
                          <Text fontWeight="600">Support Circle Check-ins</Text>
                          <Text fontSize="sm" color={subText}>Send weekly progress summaries to trusted contacts.</Text>
                        </Box>
                        <Switch isChecked={supportCircle} onChange={(e) => setSupportCircle(e.target.checked)} colorScheme="green" />
                      </HStack>

                      <HStack justify="space-between" w="100%" p={3} bg={chipBg} borderRadius="xl">
                        <Box>
                          <Text fontWeight="600">High-Risk Alerts</Text>
                          <Text fontSize="sm" color={subText}>Notify you when patterns indicate elevated risk.</Text>
                        </Box>
                        <Switch defaultChecked colorScheme="orange" />
                      </HStack>
                    </VStack>
                  </GlassCard>
                </Stack>
              </TabPanel>

              {/* Notifications */}
              <TabPanel p={0} pt={6}>
                <Stack spacing={6}>
                  <GlassCard title="Notification Preferences">
                    <VStack spacing={4} align="start">
                      <Text fontSize="sm" color={subText}>Choose what types of notifications you'd like to receive</Text>
                      {Object.entries(notifications).map(([key, value]) => (
                        <HStack key={key} justify="space-between" w="100%" p={3} bg={chipBg} borderRadius="xl">
                          <Box>
                            <Text fontWeight="600">
                              {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                            </Text>
                            <Text fontSize="sm" color={subText}>{getNotificationDescription(key)}</Text>
                          </Box>
                          <Switch isChecked={value} onChange={() => handleNotificationToggle(key)} colorScheme="blue" />
                        </HStack>
                      ))}
                    </VStack>
                  </GlassCard>

                  <GlassCard title="Notification Schedule">
                    <VStack spacing={4} align="start">
                      <Text fontSize="sm" color={subText}>Set when you'd like to receive notifications</Text>

                      <HStack justify="space-between" w="100%">
                        <Text fontWeight="600">Daily Reminders</Text>
                        <Select defaultValue="morning" size="sm" w="160px">
                          <option value="morning">Morning (8 AM)</option>
                          <option value="afternoon">Afternoon (2 PM)</option>
                          <option value="evening">Evening (7 PM)</option>
                        </Select>
                      </HStack>
                      <HStack justify="space-between" w="100%">
                        <Text fontWeight="600">Weekly Reports</Text>
                        <Select defaultValue="sunday" size="sm" w="160px">
                          <option value="sunday">Sunday</option>
                          <option value="monday">Monday</option>
                          <option value="friday">Friday</option>
                        </Select>
                      </HStack>
                      <HStack justify="space-between" w="100%">
                        <Text fontWeight="600">Quiet Hours</Text>
                        <Select defaultValue="10pm-7am" size="sm" w="160px">
                          <option value="10pm-7am">10 PM - 7 AM</option>
                          <option value="11pm-8am">11 PM - 8 AM</option>
                          <option value="none">No quiet hours</option>
                        </Select>
                      </HStack>
                    </VStack>
                  </GlassCard>
                </Stack>
              </TabPanel>

              {/* Privacy */}
              <TabPanel p={0} pt={6}>
                <Stack spacing={6}>
                  <GlassCard title="Privacy Settings">
                    <VStack spacing={4} align="start">
                      <Text fontSize="sm" color={subText}>Control how your data is used and shared</Text>
                      {Object.entries(privacy).map(([key, value]) => (
                        <HStack key={key} justify="space-between" w="100%" p={3} bg={chipBg} borderRadius="xl">
                          <Box>
                            <Text fontWeight="600">
                              {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                            </Text>
                            <Text fontSize="sm" color={subText}>{getPrivacyDescription(key)}</Text>
                          </Box>
                          <Switch isChecked={value} onChange={() => handlePrivacyToggle(key)} colorScheme={value ? 'green' : 'gray'} />
                        </HStack>
                      ))}
                    </VStack>
                  </GlassCard>

                  <GlassCard title="Data Usage">
                    <VStack spacing={4} align="start">
                      <Text fontSize="sm" color={subText}>
                        We only analyze time windows and activity types (not content). Your data is encrypted and never sold to third parties.
                      </Text>
                      <Alert status="info" borderRadius="md">
                        <AlertIcon />
                        <Box>
                          <AlertTitle>Transparent Data Usage</AlertTitle>
                          <AlertDescription fontSize="sm">
                            We use your data solely to provide personalized insights and improve your experience. You can delete all data at any time.
                          </AlertDescription>
                        </Box>
                      </Alert>
                      <HStack justify="space-between" w="100%" mt={4} flexWrap="wrap" gap={2}>
                        <Text fontSize="sm" color={subText}>This action is permanent and cannot be undone.</Text>
                        <Button variant="outline" colorScheme="red" leftIcon={<DeleteIcon />} onClick={onOpen} size="sm" w={{ base: 'full', md: 'auto' }}>
                          Delete All Data
                        </Button>
                      </HStack>
                    </VStack>
                  </GlassCard>
                </Stack>
              </TabPanel>

              {/* Data */}
              <TabPanel p={0} pt={6}>
                <Stack spacing={6}>
                  <GlassCard title="Export Your Data (Per Pillar)">
                    <VStack spacing={4} align="start">
                      <Text fontSize="sm" color={subText}>Download your data by pillar for backup or external analysis.</Text>

                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="100%">
                        {/* Habits */}
                        <VStack align="start" spacing={2} p={3} bg={chipBg} borderRadius="xl">
                          <Badge colorScheme="purple" borderRadius="full">Habits</Badge>
                          <HStack>
                            <Button leftIcon={<DownloadIcon />} size="sm" onClick={() => handlePillarExport('habits', 'pdf')}>PDF</Button>
                            <Button leftIcon={<DownloadIcon />} size="sm" variant="outline" onClick={() => handlePillarExport('habits', 'csv')}>CSV</Button>
                            <Button leftIcon={<DownloadIcon />} size="sm" variant="outline" onClick={() => handlePillarExport('habits', 'json')}>JSON</Button>
                          </HStack>
                        </VStack>

                        {/* Wealth */}
                        <VStack align="start" spacing={2} p={3} bg={chipBg} borderRadius="xl">
                          <Badge colorScheme="green" borderRadius="full">Wealth</Badge>
                          <HStack>
                            <Button leftIcon={<DownloadIcon />} size="sm" onClick={() => handlePillarExport('wealth', 'pdf')}>PDF</Button>
                            <Button leftIcon={<DownloadIcon />} size="sm" variant="outline" onClick={() => handlePillarExport('wealth', 'csv')}>CSV</Button>
                            <Button leftIcon={<DownloadIcon />} size="sm" variant="outline" onClick={() => handlePillarExport('wealth', 'json')}>JSON</Button>
                          </HStack>
                        </VStack>

                        {/* Sleep */}
                        <VStack align="start" spacing={2} p={3} bg={chipBg} borderRadius="xl">
                          <Badge colorScheme="blue" borderRadius="full">Sleep</Badge>
                          <HStack>
                            <Button leftIcon={<DownloadIcon />} size="sm" onClick={() => handlePillarExport('sleep', 'pdf')}>PDF</Button>
                            <Button leftIcon={<DownloadIcon />} size="sm" variant="outline" onClick={() => handlePillarExport('sleep', 'csv')}>CSV</Button>
                            <Button leftIcon={<DownloadIcon />} size="sm" variant="outline" onClick={() => handlePillarExport('sleep', 'json')}>JSON</Button>
                          </HStack>
                        </VStack>

                        {/* Recovery */}
                        <VStack align="start" spacing={2} p={3} bg={chipBg} borderRadius="xl">
                          <Badge colorScheme="orange" borderRadius="full">Recovery</Badge>
                          <HStack>
                            <Button leftIcon={<DownloadIcon />} size="sm" onClick={() => handlePillarExport('recovery', 'pdf')}>PDF</Button>
                            <Button leftIcon={<DownloadIcon />} size="sm" variant="outline" onClick={() => handlePillarExport('recovery', 'csv')}>CSV</Button>
                            <Button leftIcon={<DownloadIcon />} size="sm" variant="outline" onClick={() => handlePillarExport('recovery', 'json')}>JSON</Button>
                          </HStack>
                        </VStack>
                      </SimpleGrid>
                    </VStack>
                  </GlassCard>

                  <GlassCard title="Data Management">
                    <VStack spacing={4} align="start">
                      <Text fontSize="sm" color={subText}>Manage your stored data and account information</Text>

                      <HStack justify="space-between" w="100%" p={3} bg={chipBg} borderRadius="xl">
                        <Box>
                          <Text fontWeight="600">Storage Usage</Text>
                          <Text fontSize="sm" color={subText}>Approximately {Math.round((storeStats?.totalEntries ?? 0) * 0.1)}KB used</Text>
                        </Box>
                        <Progress value={45} w="120px" colorScheme="blue" />
                      </HStack>

                      <HStack justify="space-between" w="100%" p={3} bg={chipBg} borderRadius="xl">
                        <Box>
                          <Text fontWeight="600">Auto Backup</Text>
                          <Text fontSize="sm" color={subText}>Weekly automatic backups to cloud</Text>
                        </Box>
                        <Switch defaultChecked colorScheme="green" />
                      </HStack>

                      <HStack justify="space-between" w="100%" p={3} bg={chipBg} borderRadius="xl">
                        <Box>
                          <Text fontWeight="600">Data Retention</Text>
                          <Text fontSize="sm" color={subText}>Keep data for 12 months</Text>
                        </Box>
                        <Select defaultValue="12months" size="sm" w="160px">
                          <option value="3months">3 months</option>
                          <option value="6months">6 months</option>
                          <option value="12months">12 months</option>
                          <option value="forever">Forever</option>
                        </Select>
                      </HStack>
                    </VStack>
                  </GlassCard>
                </Stack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Stack>
      </Box>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete All Data</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="start">
              <Alert status="warning" borderRadius="md">
                <AlertIcon />
                This action cannot be undone!
              </Alert>
              <Text color={subText}>
                This will permanently delete all your habits, progress, achievements, and settings. You'll need to start
                over from scratch.
              </Text>
              <Text fontSize="sm" color={subText}>
                • {(storeStats?.totalHabits ?? 0)} habits will be deleted
                <br />
                • {(storeStats?.totalEntries ?? 0)} progress entries will be lost
                <br />
                • {(storeStats?.totalAchievements ?? 0)} achievements will be reset
              </Text>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={handleDeleteAllData}>
              Delete Everything
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

// Helpers
function getNotificationDescription(key) {
  const descriptions = {
    reminders: 'Daily habit reminders and notifications',
    achievements: 'When you unlock new achievements',
    challenges: 'Weekly challenge updates and progress',
    social: 'Friend activity and social features',
    weeklyReports: 'Weekly performance summary reports',
  };
  return descriptions[key] || 'Notification setting';
}
function getPrivacyDescription(key) {
  const descriptions = {
    shareProgress: 'Allow friends to see your habit progress',
    showInRankings: 'Include you in leaderboards and rankings',
    dataCollection: 'Allow anonymous data to improve AI insights',
    personalizedAds: 'Show personalized recommendations (no third-party ads)',
  };
  return descriptions[key] || 'Privacy setting';
}
