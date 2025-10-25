import React, { useState, useEffect } from 'react';
import {
  Box, Heading, Text, SimpleGrid, HStack, Badge, Stack,
  useColorModeValue, Button, VStack, Progress, IconButton,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody,
  ModalCloseButton, useDisclosure, FormControl, FormLabel,
  Input, Select, NumberInput, NumberInputField, Avatar, Tabs, TabList, TabPanels, Tab, TabPanel,
  useToast, Collapse, Alert, AlertIcon, AlertTitle, AlertDescription,
  Card, CardBody, Icon, Tooltip, Divider, AlertDialog, AlertDialogOverlay,
  AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter
} from '@chakra-ui/react';
import {
  AddIcon, DownloadIcon, TimeIcon, BellIcon, CalendarIcon, EditIcon, DeleteIcon
} from '@chakra-ui/icons';
import { FaFire, FaUsers, FaChartLine, FaAward, FaCrown, FaShare } from 'react-icons/fa';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import {
  CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis
} from 'recharts';

import {
  getHabitSeries, saveHabitEntry, getUserHabits,
  generateHabitInsights, exportHabitData,
  getAchievements, joinWeeklyChallenge, getSocialRankings,
  createHabit, updateHabit, deleteHabit
} from '../services/dataStore';

export default function Habits() {
  const [habits, setHabits] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [achievements, setAchievements] = useState([]);
  const [socialRankings, setSocialRankings] = useState([]);
  const [activeTab, setActiveTab] = useState(0);

  const createModal = useDisclosure();
  const editModal = useDisclosure();
  const [draftHabit, setDraftHabit] = useState(null);
  const [editHabitId, setEditHabitId] = useState(null);

  const [showExportOptions, setShowExportOptions] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  // Colors
  const subText = useColorModeValue('gray.600', 'gray.400');
  const chipBg = useColorModeValue('blackAlpha.50', 'whiteAlpha.100');
  const chipBr = useColorModeValue('blackAlpha.200', 'whiteAlpha.300');
  const heroFrom = useColorModeValue('brand.500', 'brand.600');
  const heroTo = useColorModeValue('brand.700', 'brand.700');

  useEffect(() => { loadUserData(); }, []);

  const loadUserData = async () => {
    const [userHabits, insights, userAchievements, rankings] = await Promise.all([
      getUserHabits(),
      generateHabitInsights(),
      getAchievements(),
      getSocialRankings()
    ]);
    setHabits(userHabits);
    setAnalytics(insights);
    setAchievements(userAchievements);
    setSocialRankings(rankings);
  };

  const addHabitEntry = async (habitId, value) => {
    try {
      await saveHabitEntry(habitId, value);
      await loadUserData();
      toast({ title: 'Progress saved!', status: 'success', duration: 1600 });
    } catch {
      toast({ title: 'Error saving entry', status: 'error' });
    }
  };

  const handleExport = async (format) => {
    try {
      await exportHabitData(format);
      toast({ title: `Exported as ${format.toUpperCase()}`, status: 'success' });
      setShowExportOptions(false);
    } catch {
      toast({ title: 'Export failed', status: 'error' });
    }
  };

  const joinChallenge = async (challengeId) => {
    await joinWeeklyChallenge(challengeId);
    toast({ title: 'Challenge joined!', status: 'success' });
    loadUserData();
  };

  // ---------- CRUD: Create ----------
  const onOpenCreate = () => {
    setDraftHabit({
      name: '',
      category: '',
      type: 'numeric',
      goal: '',
      unit: '',
      reminder: false,
      optimalTime: '',
      description: ''
    });
    createModal.onOpen();
  };

  const onCreate = async () => {
    if (!draftHabit?.name) {
      toast({ title: 'Name is required', status: 'warning' });
      return;
    }
    try {
      await createHabit(draftHabit);
      toast({ title: 'Habit created', status: 'success' });
      createModal.onClose();
      await loadUserData();
    } catch (e) {
      toast({ title: 'Failed to create habit', description: e.message, status: 'error' });
    }
  };

  // ---------- CRUD: Edit ----------
  const onOpenEdit = (habit) => {
    setEditHabitId(habit.id);
    setDraftHabit({
      name: habit.name,
      category: habit.category,
      type: habit.type,
      goal: habit.goal,
      unit: habit.unit,
      reminder: habit.reminder,
      optimalTime: habit.optimalTime,
      description: habit.description || ''
    });
    editModal.onOpen();
  };

  const onSaveEdit = async () => {
    try {
      await updateHabit(editHabitId, draftHabit);
      toast({ title: 'Habit updated', status: 'success' });
      editModal.onClose();
      await loadUserData();
    } catch (e) {
      toast({ title: 'Update failed', description: e.message, status: 'error' });
    }
  };

  // ---------- CRUD: Delete ----------
  const [deleteId, setDeleteId] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const cancelRef = React.useRef();

  const askDelete = (id) => { setDeleteId(id); setDeleteOpen(true); };
  const confirmDelete = async () => {
    try {
      await deleteHabit(deleteId);
      toast({ title: 'Habit deleted', status: 'success' });
      setDeleteOpen(false);
      await loadUserData();
    } catch (e) {
      toast({ title: 'Delete failed', description: e.message, status: 'error' });
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
        <VStack spacing={4} align="start" maxW="7xl" mx="auto">
          <HStack justify="space-between" w="100%" align="flex-start">
            <Box>
              <Heading size="xl" fontWeight="800" letterSpacing=".3px">
                Habit Intelligence
              </Heading>
              <Text fontSize="lg" opacity={0.95}>
                Master your routines with AI-powered insights
              </Text>
            </Box>
            <HStack>
              <Badge colorScheme="yellow" variant="solid" borderRadius="full" px={3}>
                <HStack spacing={2}>
                  <Icon as={FaAward} />
                  <Text>{achievements.length} Achievements</Text>
                </HStack>
              </Badge>
            </HStack>
          </HStack>

          <HStack spacing={4} flexWrap="wrap">
            <Button leftIcon={<AddIcon />} onClick={onOpenCreate} variant="solid">
              Add Habit
            </Button>

            {/* Navigate to Weekly Plan page */}
            <Button
              leftIcon={<CalendarIcon />}
              variant="outline"
              color="white"
              borderColor="whiteAlpha.500"
              onClick={() => navigate('/habits/plan')}
            >
              Predictive Schedule
            </Button>

            {/* Navigate to Coach page (route added below) */}
            <Button
              as={RouterLink}
              to="/habits/coach"
              variant="outline"
              color="white"
              borderColor="whiteAlpha.500"
            >
              AI Habits Coach
            </Button>

            <Button
              leftIcon={<DownloadIcon />}
              variant="outline"
              color="white"
              borderColor="whiteAlpha.500"
              onClick={() => setShowExportOptions(!showExportOptions)}
            >
              Export Data
            </Button>
            <Button leftIcon={<FaShare />} variant="outline" color="white" borderColor="whiteAlpha.500">
              Share Progress
            </Button>
          </HStack>

          <Collapse in={showExportOptions} animateOpacity>
            <HStack spacing={2} mt={3} p={3} bg="whiteAlpha.200" borderRadius="lg">
              <Text fontSize="sm">Export as:</Text>
              <Button size="sm" onClick={() => handleExport('pdf')}>PDF Report</Button>
              <Button size="sm" onClick={() => handleExport('csv')}>CSV Data</Button>
              <Button size="sm" onClick={() => handleExport('json')}>JSON</Button>
            </HStack>
          </Collapse>
        </VStack>
      </Box>

      {/* Content */}
      <Box px={{ base: 4, md: 8 }} pt={{ base: 6, md: 10 }} pb={{ base: 14, md: 20 }}>
        <Tabs variant="enclosed" colorScheme="purple" onChange={setActiveTab}>
          <TabList mb={6} flexWrap={{ base: 'wrap', md: 'nowrap' }} gap={{ base: 2, md: 0 }}
            overflowX={{ base: 'auto', md: 'visible' }} pb={{ base: 2, md: 0 }}
            sx={{ '::-webkit-scrollbar': { display: 'none' }, scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <Tab><HStack spacing={2}><FaChartLine /><Text>Dashboard</Text></HStack></Tab>
            <Tab>
              <HStack spacing={2}>
                <FaAward />
                <Text>Achievements</Text>
                {achievements.length > 0 && (
                  <Badge colorScheme="green" borderRadius="full" minW={5} textAlign="center">
                    {achievements.length}
                  </Badge>
                )}
              </HStack>
            </Tab>
            <Tab><HStack spacing={2}><FaUsers /><Text>Social</Text></HStack></Tab>
            <Tab><HStack spacing={2}><FaCrown /><Text>Challenges</Text></HStack></Tab>
          </TabList>

          <TabPanels>
            {/* Dashboard */}
            <TabPanel p={0}>
              <SimpleGrid maxW="7xl" mx="auto" columns={{ base: 1, lg: 2, xl: 3 }} spacing={6}>
                {/* Predictive Scheduling preview */}
                <GlassCard title="🕐 Predictive Scheduling" colSpan={{ base: 1, xl: 2 }}>
                  <VStack spacing={4} align="start">
                    <Text fontSize="sm" color={subText}>
                      AI-suggested optimal times based on your patterns
                    </Text>

                    {analytics.predictiveSchedule?.map((schedule, index) => (
                      <HStack key={index} w="100%" p={3} bg={chipBg} borderRadius="md"
                        justify="space-between" border="1px solid" borderColor={chipBr}>
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="600">{schedule.habit}</Text>
                          <Text fontSize="sm" color={subText}>{schedule.time}</Text>
                        </VStack>
                        <HStack>
                          <Badge colorScheme={schedule.confidence > 70 ? 'green' : 'orange'}>
                            {schedule.confidence}% match
                          </Badge>
                          <Tooltip label="Set reminder">
                            <IconButton size="sm" icon={<BellIcon />} aria-label="Set reminder" />
                          </Tooltip>
                        </HStack>
                      </HStack>
                    ))}

                    <Button size="sm" variant="outline" leftIcon={<TimeIcon />}
                      onClick={() => navigate('/habits/plan')}>
                      Generate Weekly Plan
                    </Button>
                  </VStack>
                </GlassCard>

                {/* Forecast */}
                <GlassCard title="📈 Progress Forecast">
                  <VStack spacing={3}>
                    <Text fontSize="sm" textAlign="center">Based on your current streak</Text>
                    <Progress
                      value={analytics.forecast?.successProbability || 0}
                      colorScheme="green" size="lg" w="100%" borderRadius="full"
                    />
                    <Text fontSize="2xl" fontWeight="bold">
                      {analytics.forecast?.successProbability || 0}%
                    </Text>
                    <Text fontSize="sm" textAlign="center" color={subText}>
                      Chance of maintaining streak this week
                    </Text>
                    {analytics.forecast?.riskFactors && (
                      <Alert status="warning" size="sm" borderRadius="md">
                        <AlertIcon />
                        <Box>
                          <AlertTitle>Watch out for:</AlertTitle>
                          <AlertDescription fontSize="xs">
                            {analytics.forecast.riskFactors.join(', ')}
                          </AlertDescription>
                        </Box>
                      </Alert>
                    )}
                  </VStack>
                </GlassCard>

                {/* Correlations */}
                <GlassCard title="🔗 Habit Correlations">
                  <VStack spacing={3}>
                    {analytics.correlations?.map((correlation, index) => (
                      <HStack key={index} w="100%" justify="space-between">
                        <Text fontSize="sm">{correlation.relationship}</Text>
                        <Badge colorScheme={
                          Math.abs(correlation.strength) > 0.7 ? 'green' :
                          Math.abs(correlation.strength) > 0.4 ? 'orange' : 'gray'
                        }>
                          {Math.abs(correlation.strength * 100).toFixed(0)}%
                        </Badge>
                      </HStack>
                    ))}
                    <Text fontSize="xs" color={subText} textAlign="center">
                      Positive correlations show habits that support each other
                    </Text>
                  </VStack>
                </GlassCard>

                {/* Today’s Tracking + quick Edit/Delete */}
                <GlassCard title="Today's Tracking">
                  <VStack spacing={4}>
                    {habits.slice(0, 6).map(habit => (
                      <HStack key={habit.id} w="100%" justify="space-between" p={3}
                        bg={chipBg} borderRadius="md" border="1px solid" borderColor={chipBr}>
                        <VStack align="start" spacing={1}>
                          <HStack>
                            <Text fontWeight="600">{habit.name}</Text>
                            <Tooltip label="Edit"><IconButton
                              aria-label="Edit" size="xs" icon={<EditIcon />} variant="ghost"
                              onClick={() => onOpenEdit(habit)} /></Tooltip>
                            <Tooltip label="Delete"><IconButton
                              aria-label="Delete" size="xs" colorScheme="red" variant="ghost"
                              icon={<DeleteIcon />} onClick={() => askDelete(habit.id)} /></Tooltip>
                          </HStack>
                          <Text fontSize="sm" color={subText}>{habit.category}</Text>
                          {habit.streak > 0 && (
                            <HStack spacing={1}><FaFire color="orange" /><Text fontSize="xs">{habit.streak} days</Text></HStack>
                          )}
                        </VStack>
                        <HStack>
                          <NumberInput size="sm" min={0} max={100} w="80px" defaultValue={0}>
                            <NumberInputField onChange={(e) => addHabitEntry(habit.id, e.target.value)} />
                          </NumberInput>
                          <Text fontSize="sm">{habit.unit}</Text>
                        </HStack>
                      </HStack>
                    ))}
                    <Button leftIcon={<AddIcon />} variant="ghost" size="sm" onClick={onOpenCreate}>
                      Track more habits
                    </Button>
                  </VStack>
                </GlassCard>

                {/* Smart Reminders */}
                <GlassCard title="🎯 Smart Reminders">
                  <VStack spacing={3}>
                    {analytics.motivationTriggers?.map((trigger, index) => (
                      <HStack key={index} w="100%" p={2} bg="blue.50" borderRadius="md">
                        <BellIcon color="blue.500" />
                        <Box>
                          <Text fontSize="sm" fontWeight="600">{trigger.title}</Text>
                          <Text fontSize="xs" color={subText}>{trigger.condition}</Text>
                        </Box>
                      </HStack>
                    ))}
                    <Button size="sm" variant="outline" w="100%">
                      Configure Reminders
                    </Button>
                  </VStack>
                </GlassCard>

                {/* One chart per habit with edit/delete controls */}
                {habits.map(habit => (
                  <GlassCard key={habit.id} title={
                    <HStack justify="space-between" w="100%">
                      <Text>{habit.name}</Text>
                      <HStack>
                        <IconButton aria-label="Edit" size="sm" icon={<EditIcon />} variant="ghost"
                          onClick={() => onOpenEdit(habit)} />
                        <IconButton aria-label="Delete" size="sm" icon={<DeleteIcon />} colorScheme="red" variant="ghost"
                          onClick={() => askDelete(habit.id)} />
                      </HStack>
                    </HStack>
                  }>
                    <Stack gap={3} mb={2}>
                      <HStack justify="space-between">
                        <Badge variant="outline" colorScheme={getCategoryColor(habit.category)}>
                          {habit.category}
                        </Badge>
                        <Text fontSize="sm" fontWeight="600">Streak: {habit.streak} days</Text>
                      </HStack>
                      <Text fontSize="sm" color={subText}>{habit.description}</Text>
                    </Stack>
                    <Box minW={0} width="100%">
                      <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={habit.history}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <RTooltip />
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke={colorForCategory(habit.category)}
                            fill={colorForCategory(habit.category)}
                            fillOpacity={0.3}
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </Box>
                  </GlassCard>
                ))}
              </SimpleGrid>
            </TabPanel>

            {/* Achievements */}
            <TabPanel p={0}>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {achievements.map(achievement => (
                  <GlassCard key={achievement.id}>
                    <VStack spacing={3} textAlign="center">
                      <Icon as={FaAward} w={8} h={8} color="yellow.500" />
                      <Text fontWeight="bold">{achievement.title}</Text>
                      <Text fontSize="sm" color={subText}>{achievement.description}</Text>
                      <Badge colorScheme="green" borderRadius="full">
                        Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </Badge>
                    </VStack>
                  </GlassCard>
                ))}
                <GlassCard opacity={0.7}>
                  <VStack spacing={3} textAlign="center">
                    <Icon as={FaAward} w={8} h={8} color="gray.400" />
                    <Text fontWeight="bold" color="gray.500">30-Day Master</Text>
                    <Text fontSize="sm" color="gray.500">Maintain a habit for 30 days</Text>
                    <Badge colorScheme="gray" borderRadius="full">Locked</Badge>
                  </VStack>
                </GlassCard>
              </SimpleGrid>
            </TabPanel>

            {/* Social */}
            <TabPanel p={0}>
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                <GlassCard title="🏆 Leaderboard">
                  <VStack spacing={3}>
                    {socialRankings.map((user, index) => (
                      <HStack key={user.id} w="100%" justify="space-between" p={3}
                        bg={index < 3 ? 'yellow.50' : 'transparent'} borderRadius="md">
                        <HStack spacing={3}>
                          <Text fontWeight="bold" color={index < 3 ? 'yellow.600' : subText}>#{index + 1}</Text>
                          <Avatar size="sm" name={user.name} src={user.avatar} />
                          <Text fontWeight="600">{user.name}</Text>
                        </HStack>
                        <HStack><FaFire color="orange" /><Text>{user.totalStreak} days</Text></HStack>
                      </HStack>
                    ))}
                  </VStack>
                </GlassCard>

                <GlassCard title="👥 Social Feed">
                  <VStack spacing={4}>
                    <Card variant="outline" w="100%">
                      <CardBody>
                        <HStack spacing={3}>
                          <Avatar size="sm" name="Alex Chen" />
                          <Box>
                            <Text fontSize="sm" fontWeight="600">Alex Chen</Text>
                            <Text fontSize="xs" color={subText}>Just completed a 7-day meditation streak! 🧘‍♂️</Text>
                          </Box>
                        </HStack>
                      </CardBody>
                    </Card>
                    <Button leftIcon={<FaShare />} variant="outline" w="100%">Share My Progress</Button>
                  </VStack>
                </GlassCard>
              </SimpleGrid>
            </TabPanel>

            {/* Challenges */}
            <TabPanel p={0}>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <GlassCard title="🏅 Weekly Challenges">
                  <VStack spacing={4}>
                    <Card w="100%" bg="blue.50" borderColor="blue.2 00">
                      <CardBody>
                        <HStack justify="space-between">
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="bold">7-Day Fitness Challenge</Text>
                            <Text fontSize="sm">Complete 5 workouts this week</Text>
                            <HStack><FaUsers /><Text fontSize="xs">24 participants</Text></HStack>
                          </VStack>
                          <Button colorScheme="blue" size="sm" onClick={() => joinChallenge('fitness-weekly')}>Join</Button>
                        </HStack>
                      </CardBody>
                    </Card>

                    <Card w="100%">
                      <CardBody>
                        <HStack justify="space-between">
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="bold">Mindfulness Marathon</Text>
                            <Text fontSize="sm">Meditate daily for 14 days</Text>
                            <HStack><FaUsers /><Text fontSize="xs">18 participants</Text></HStack>
                          </VStack>
                          <Button variant="outline" size="sm" onClick={() => joinChallenge('mindfulness-marathon')}>Join</Button>
                        </HStack>
                      </CardBody>
                    </Card>
                  </VStack>
                </GlassCard>

                <GlassCard title="My Challenge Progress">
                  <VStack spacing={3}>
                    <Text fontSize="sm" color={subText}>You're not participating in any challenges yet. Join one to get started!</Text>
                    <Button colorScheme="purple" leftIcon={<FaCrown />}>Browse All Challenges</Button>
                  </VStack>
                </GlassCard>
              </SimpleGrid>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>

      {/* Create Habit Modal */}
      <HabitModal
        title="Create New Habit"
        isOpen={createModal.isOpen}
        onClose={createModal.onClose}
        draft={draftHabit}
        setDraft={setDraftHabit}
        onSubmit={onCreate}
      />

      {/* Edit Habit Modal */}
      <HabitModal
        title="Edit Habit"
        isOpen={editModal.isOpen}
        onClose={() => { editModal.onClose(); setEditHabitId(null); }}
        draft={draftHabit}
        setDraft={setDraftHabit}
        onSubmit={onSaveEdit}
      />

      {/* Delete confirm */}
      <AlertDialog isOpen={deleteOpen} leastDestructiveRef={cancelRef} onClose={() => setDeleteOpen(false)}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Delete Habit?</AlertDialogHeader>
            <AlertDialogBody>This will remove the habit and its entries. This action cannot be undone.</AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setDeleteOpen(false)}>Cancel</Button>
              <Button colorScheme="red" onClick={confirmDelete} ml={3}>Delete</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}

/** Reusable Create/Edit modal */
function HabitModal({ title, isOpen, onClose, draft, setDraft, onSubmit }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Habit Name</FormLabel>
              <Input
                value={draft?.name || ''}
                placeholder="e.g., Morning Meditation"
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Category</FormLabel>
              <Select
                value={draft?.category || ''}
                placeholder="Select category"
                onChange={(e) => setDraft({ ...draft, category: e.target.value })}
              >
                <option value="health">Health & Fitness</option>
                <option value="productivity">Productivity</option>
                <option value="wealth">Wealth & Finance</option>
                <option value="mindfulness">Mindfulness</option>
                <option value="learning">Learning</option>
                <option value="social">Social & Relationships</option>
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Tracking Type</FormLabel>
              <Select
                value={draft?.type || 'numeric'}
                onChange={(e) => setDraft({ ...draft, type: e.target.value })}
              >
                <option value="boolean">Yes/No Completion</option>
                <option value="numeric">Number (minutes, cups, etc.)</option>
                <option value="scale">Scale (1-10)</option>
                <option value="currency">Money ($)</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Goal</FormLabel>
              <Input
                value={draft?.goal || ''}
                placeholder="e.g., 30 minutes daily"
                onChange={(e) => setDraft({ ...draft, goal: e.target.value })}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Unit</FormLabel>
              <Input
                value={draft?.unit || ''}
                placeholder="min, cups, pages…"
                onChange={(e) => setDraft({ ...draft, unit: e.target.value })}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Optimal Time</FormLabel>
              <Select
                value={draft?.optimalTime || ''}
                placeholder="Let AI determine"
                onChange={(e) => setDraft({ ...draft, optimalTime: e.target.value })}
              >
                <option value="morning">Morning (6-10 AM)</option>
                <option value="midday">Midday (10-2 PM)</option>
                <option value="afternoon">Afternoon (2-6 PM)</option>
                <option value="evening">Evening (6-10 PM)</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Description</FormLabel>
              <Input
                value={draft?.description || ''}
                placeholder="(optional) short description"
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              />
            </FormControl>

            <Button colorScheme="blue" w="100%" onClick={onSubmit}>
              Save
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

const getCategoryColor = (category) => {
  const colors = { health: 'green', productivity: 'blue', wealth: 'yellow', mindfulness: 'purple', learning: 'orange', social: 'pink' };
  return colors[category] || 'gray';
};
const colorForCategory = (category) => {
  const colors = {
    health: '#38A169', productivity: '#3182CE', wealth: '#D69E2E',
    mindfulness: '#805AD5', learning: '#DD6B20', social: '#D53F8C', default: '#718096'
  };
  return colors[category] || colors.default;
};
