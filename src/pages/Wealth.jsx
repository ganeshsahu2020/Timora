// src/pages/Wealth.jsx
import React, { useState, useEffect } from 'react';
import {
  Box, Heading, Text, SimpleGrid, HStack, Badge, Stack,
  useColorModeValue, Button, VStack, Progress, IconButton,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody,
  ModalCloseButton, useDisclosure, FormControl, FormLabel,
  Input, Select, NumberInput, NumberInputField, Tabs, TabList, TabPanels, Tab, TabPanel,
  useToast, Collapse, Alert, AlertIcon, AlertTitle, AlertDescription,
  Card, CardBody, Icon, Tooltip, Divider, Table, Thead, Tbody, Tr, Th, Td,
  Stat, StatLabel, StatNumber, StatHelpText, StatArrow, Wrap, WrapItem
} from '@chakra-ui/react';
import { AddIcon, DownloadIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import {
  FaMoneyBillWave, FaPiggyBank, FaChartLine, FaCreditCard,
  FaUniversity, FaHandHoldingUsd, FaShieldAlt, FaRobot,
  FaExchangeAlt, FaDollarSign, FaChartPie, FaLightbulb, FaCalculator
} from 'react-icons/fa';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

import GlassCard from '../components/GlassCard';
import {
  CartesianGrid, Tooltip as RTooltip, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, LineChart, Line, PieChart, Pie, Cell,
  BarChart, Bar
} from 'recharts';

// NOTE: remove saveFinancialEntry (it isn't exported)
import {
  getWealthData, generateFinancialInsights,
  exportWealthReport, calculateSavingsGoals, getAIFinancialAdvice,
  addInvestment, addDebt, addIncome, addExpense
} from '../services/wealthStore';

export default function Wealth() {
  // ---- Hooks ----------------------------------------------------------------
  const [financialData, setFinancialData] = useState({});
  const [insights, setInsights] = useState({});
  const [activeTab, setActiveTab] = useState(0);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [aiAdvice, setAiAdvice] = useState(null);
  const [calculations, setCalculations] = useState({});
  const navigate = useNavigate();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [transactionType, setTransactionType] = useState('income');
  const toast = useToast();

  // Color tokens
  const heroFrom = useColorModeValue('brand.500', 'brand.600');
  const heroTo = useColorModeValue('brand.700', 'brand.700');
  const subText = useColorModeValue('gray.700', 'gray.300');
  const chipBg = useColorModeValue('blackAlpha.50', 'whiteAlpha.100');
  const chipBr = useColorModeValue('blackAlpha.200', 'whiteAlpha.300');

  useEffect(() => {
    loadWealthData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadWealthData = async () => {
    try {
      const [data, financialInsights, advice] = await Promise.all([
        getWealthData(),
        generateFinancialInsights(),
        getAIFinancialAdvice()
      ]);

      setFinancialData(data || {});
      setInsights(financialInsights || {});
      setAiAdvice(advice || null);
    } catch (error) {
      console.error('Error loading wealth data:', error);
    }
  };

  const handleAddTransaction = async (transaction) => {
    try {
      switch (transactionType) {
        case 'income':
          await addIncome(transaction);
          break;
        case 'expense':
          await addExpense(transaction);
          break;
        case 'investment':
          await addInvestment(transaction);
          break;
        case 'debt':
          await addDebt(transaction);
          break;
        default:
          break;
      }

      await loadWealthData();
      toast({
        title: 'Transaction added!',
        status: 'success',
        duration: 2000,
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Error adding transaction',
        status: 'error',
      });
    }
  };

  const handleExport = async (format) => {
    try {
      await exportWealthReport(format);
      toast({
        title: `Exported as ${format.toUpperCase()}`,
        status: 'success',
        duration: 2000,
      });
      setShowExportOptions(false);
    } catch (error) {
      toast({
        title: 'Export failed',
        status: 'error',
      });
    }
  };

  const calculateSavings = async (goal) => {
    const result = await calculateSavingsGoals(goal);
    setCalculations(result || {});
    toast({
      title: 'Savings calculated!',
      status: 'success',
    });
  };

  // Calculate financial metrics
  const getNetWorth = () => {
    const assets = financialData.assets || 0;
    const liabilities = financialData.liabilities || 0;
    return assets - liabilities;
  };

  const getSavingsRate = () => {
    const income = financialData.totalIncome || 1;
    const expenses = financialData.totalExpenses || 0;
    return ((income - expenses) / income) * 100;
  };

  const getDebtToIncome = () => {
    const debt = financialData.totalDebt || 0;
    const income = financialData.totalIncome || 1;
    return (debt / income) * 100;
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
                Wealth Intelligence
              </Heading>
              <Text opacity={0.95}>
                AI-powered financial monitoring and optimization
              </Text>
            </Box>
            <Badge colorScheme="green" variant="solid" borderRadius="full" px={3}>
              <HStack spacing={2}>
                <FaDollarSign />
                <Text>Net Worth: ${getNetWorth().toLocaleString()}</Text>
              </HStack>
            </Badge>
          </HStack>

          {/* Header actions */}
          <Wrap spacing={3}>
            <WrapItem>
              <Button leftIcon={<AddIcon />} onClick={onOpen} variant="solid" size="sm" w={{ base: 'full', sm: 'auto' }}>
                Add Transaction
              </Button>
            </WrapItem>
            <WrapItem>
              <Button leftIcon={<FaCalculator />} variant="outline" color="white" borderColor="whiteAlpha.500" size="sm" w={{ base: 'full', sm: 'auto' }}>
                Financial Calculator
              </Button>
            </WrapItem>
            <WrapItem>
              <Button
                leftIcon={<DownloadIcon />}
                variant="outline"
                color="white"
                borderColor="whiteAlpha.500"
                onClick={() => setShowExportOptions(!showExportOptions)}
                size="sm"
                w={{ base: 'full', sm: 'auto' }}
              >
                Export Report
              </Button>
            </WrapItem>

            {/* Link to AI Financial Advisor page */}
            <WrapItem>
              <Button
                as={RouterLink}
                to="/wealth/advisor"
                leftIcon={<FaRobot />}
                variant="outline"
                color="white"
                borderColor="whiteAlpha.500"
                size="sm"
                w={{ base: 'full', sm: 'auto' }}
              >
                AI Advisor
              </Button>
            </WrapItem>

            {/* ⬇️ NEW: Configure Reminders for Wealth */}
            <WrapItem>
              <Button
                onClick={() => navigate('/reminders?type=wealth&title=Monthly%20Budget')}
                variant="outline"
                color="white"
                borderColor="whiteAlpha.500"
                size="sm"
                w={{ base: 'full', sm: 'auto' }}
              >
                Configure Reminders
              </Button>
            </WrapItem>
          </Wrap>

          {/* Export Options */}
          <Collapse in={showExportOptions} animateOpacity>
            <Wrap spacing={2} mt={3} p={3} bg="whiteAlpha.200" borderRadius="lg">
              <WrapItem><Text fontSize="sm">Export as:</Text></WrapItem>
              <WrapItem><Button size="sm" onClick={() => handleExport('pdf')} w={{ base: 'full', sm: 'auto' }}>PDF Report</Button></WrapItem>
              <WrapItem><Button size="sm" onClick={() => handleExport('csv')} w={{ base: 'full', sm: 'auto' }}>CSV Data</Button></WrapItem>
              <WrapItem><Button size="sm" onClick={() => handleExport('json')} w={{ base: 'full', sm: 'auto' }}>JSON</Button></WrapItem>
            </Wrap>
          </Collapse>
        </VStack>
      </Box>

      {/* Content */}
      <Box px={{ base: 4, md: 8 }} pt={{ base: 6, md: 10 }} pb={{ base: 14, md: 20 }}>
        <Tabs variant="enclosed" colorScheme="green" onChange={setActiveTab}>
          {/* Mobile-safe tab list */}
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
              { icon: FaExchangeAlt, label: 'Transactions' },
              { icon: FaChartPie, label: 'Analytics' },
              { icon: FaCalculator, label: 'Calculator' },
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
                {/* Financial Overview */}
                <GlassCard title="💰 Financial Snapshot" colSpan={{ base: 1, xl: 3 }}>
                  <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
                    <Stat>
                      <StatLabel>Net Worth</StatLabel>
                      <StatNumber>${getNetWorth().toLocaleString()}</StatNumber>
                      <StatHelpText>
                        <StatArrow type={getNetWorth() > 0 ? 'increase' : 'decrease'} />
                        Total Assets - Liabilities
                      </StatHelpText>
                    </Stat>

                    <Stat>
                      <StatLabel>Savings Rate</StatLabel>
                      <StatNumber>{getSavingsRate().toFixed(1)}%</StatNumber>
                      <StatHelpText>
                        <Progress value={getSavingsRate()} colorScheme="green" size="sm" mt={1} />
                      </StatHelpText>
                    </Stat>

                    <Stat>
                      <StatLabel>Debt to Income</StatLabel>
                      <StatNumber>{getDebtToIncome().toFixed(1)}%</StatNumber>
                      <StatHelpText>
                        <Progress value={getDebtToIncome()} colorScheme="red" size="sm" mt={1} />
                      </StatHelpText>
                    </Stat>

                    <Stat>
                      <StatLabel>Investment Return</StatLabel>
                      <StatNumber>8.2%</StatNumber>
                      <StatHelpText>
                        <StatArrow type="increase" />
                        YTD Performance
                      </StatHelpText>
                    </Stat>
                  </SimpleGrid>
                </GlassCard>

                {/* Asset Allocation */}
                <GlassCard title="📊 Asset Allocation" colSpan={{ base: 1, lg: 2 }}>
                  <HStack spacing={6} align="start" flexWrap="wrap">
                    <Box flex="1" minW="260px">
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie
                            data={financialData.assetAllocation || []}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {(financialData.assetAllocation || []).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <RTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                    <VStack spacing={2} align="start" flex="1" minW="240px">
                      {(financialData.assetAllocation || []).map((asset, index) => (
                        <HStack key={asset.name} justify="space-between" w="100%">
                          <HStack>
                            <Box w="3" h="3" borderRadius="full" bg={COLORS[index % COLORS.length]} />
                            <Text fontSize="sm">{asset.name}</Text>
                          </HStack>
                          <Text fontSize="sm" fontWeight="600">
                            ${asset.value.toLocaleString()}
                          </Text>
                        </HStack>
                      ))}
                    </VStack>
                  </HStack>
                </GlassCard>

                {/* Cash Flow */}
                <GlassCard title="💸 Cash Flow">
                  <VStack spacing={3}>
                    <HStack justify="space-between" w="100%">
                      <Text fontSize="sm">Monthly Income</Text>
                      <Badge colorScheme="green">
                        ${financialData.monthlyIncome?.toLocaleString()}
                      </Badge>
                    </HStack>
                    <HStack justify="space-between" w="100%">
                      <Text fontSize="sm">Monthly Expenses</Text>
                      <Badge colorScheme="red">
                        ${financialData.monthlyExpenses?.toLocaleString()}
                      </Badge>
                    </HStack>
                    <Divider />
                    <HStack justify="space-between" w="100%">
                      <Text fontWeight="600">Net Cash Flow</Text>
                      <Badge colorScheme={getSavingsRate() > 0 ? 'green' : 'red'}>
                        ${((financialData.monthlyIncome || 0) - (financialData.monthlyExpenses || 0)).toLocaleString()}
                      </Badge>
                    </HStack>
                    <Progress
                      value={getSavingsRate()}
                      colorScheme={getSavingsRate() > 20 ? 'green' : getSavingsRate() > 0 ? 'yellow' : 'red'}
                      size="lg"
                      w="100%"
                      borderRadius="full"
                    />
                  </VStack>
                </GlassCard>

                {/* Recent Transactions */}
                <GlassCard title="Recent Transactions">
                  <VStack spacing={3} align="start">
                    {(financialData.recentTransactions || []).slice(0, 5).map((transaction, index) => (
                      <HStack key={index} w="100%" justify="space-between" p={2} bg={chipBg} borderRadius="md">
                        <VStack align="start" spacing={0}>
                          <Text fontSize="sm" fontWeight="600">{transaction.description}</Text>
                          <Text fontSize="xs" color={subText}>{transaction.category}</Text>
                        </VStack>
                        <Badge colorScheme={transaction.type === 'income' ? 'green' : 'red'}>
                          {transaction.type === 'income' ? '+' : '-'}${transaction.amount}
                        </Badge>
                      </HStack>
                    ))}
                    <Button size="sm" variant="ghost" w="100%" onClick={onOpen}>
                      View All Transactions
                    </Button>
                  </VStack>
                </GlassCard>

                {/* Debt Overview */}
                <GlassCard title="🏦 Debt Summary">
                  <VStack spacing={3}>
                    {(financialData.debts || []).map((debt, index) => (
                      <HStack key={index} w="100%" justify="space-between">
                        <VStack align="start" spacing={0}>
                          <Text fontSize="sm" fontWeight="600">{debt.name}</Text>
                          <Text fontSize="xs" color={subText}>
                            {debt.interestRate}% • ${debt.minimumPayment}/mo
                          </Text>
                        </VStack>
                        <Text fontSize="sm" fontWeight="600">
                          ${debt.balance.toLocaleString()}
                        </Text>
                      </HStack>
                    ))}
                    <Progress
                      value={((financialData.totalDebt || 0) / (financialData.assets || 1)) * 100}
                      colorScheme="red"
                      size="sm"
                      w="100%"
                      borderRadius="full"
                    />
                    <Text fontSize="xs" color={subText}>
                      Debt to Asset Ratio
                    </Text>
                  </VStack>
                </GlassCard>

                {/* Investment Performance */}
                <GlassCard title="📈 Investments">
                  <VStack spacing={3}>
                    <ResponsiveContainer width="100%" height={120}>
                      <AreaChart data={financialData.investmentHistory || []}>
                        <Area type="monotone" dataKey="value" stroke="#38A169" fill="#38A169" fillOpacity={0.3} />
                        <XAxis dataKey="date" hide />
                        <YAxis hide />
                        <RTooltip />
                      </AreaChart>
                    </ResponsiveContainer>
                    <HStack justify="space-between" w="100%">
                      <Text fontSize="sm">Total Portfolio</Text>
                      <Badge colorScheme="green">
                        ${financialData.investmentTotal?.toLocaleString()}
                      </Badge>
                    </HStack>
                    <HStack justify="space-between" w="100%">
                      <Text fontSize="sm">YTD Return</Text>
                      <Text fontSize="sm" fontWeight="600" color="green.500">
                        +8.2%
                      </Text>
                    </HStack>
                  </VStack>
                </GlassCard>

                {/* NEW: Wealth Report Tile */}
                <GlassCard title="📄 Wealth Report">
                  <VStack align="start" spacing={3}>
                    <Text fontSize="sm" color={subText}>
                      Open your detailed Wealth Report to print, share, or export PDF/CSV/JSON. See trends, allocation,
                      and recent transactions in one place.
                    </Text>
                    <HStack>
                      <Button
                        as={RouterLink}
                        to="/wealth/report"
                        colorScheme="blue"
                        leftIcon={<FaChartPie />}
                      >
                        View Full Report
                      </Button>
                      <Button
                        as={RouterLink}
                        to="/wealth/report"
                        variant="ghost"
                        size="sm"
                      >
                        Open report →
                      </Button>
                    </HStack>
                  </VStack>
                </GlassCard>
              </SimpleGrid>
            </TabPanel>

            {/* Transactions Tab */}
            <TabPanel p={0}>
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                <GlassCard title="Transaction History" colSpan={{ base: 1, lg: 2 }}>
                  {/* 👇 Keep table inside the grid on mobile */}
                  <Box w="100%" overflowX={{ base: 'auto', md: 'visible' }} overflowY="hidden">
                    <Table
                      variant="simple"
                      size={{ base: 'sm', md: 'md' }}
                      minW={{ base: '640px', md: '100%' }}
                    >
                      <Thead>
                        <Tr>
                          <Th>Date</Th>
                          <Th>Description</Th>
                          <Th>Category</Th>
                          <Th isNumeric>Amount</Th>
                          <Th>Actions</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {(financialData.transactions || []).map((transaction, index) => (
                          <Tr key={index}>
                            <Td>{transaction.date}</Td>
                            <Td>{transaction.description}</Td>
                            <Td>
                              <Badge colorScheme={getCategoryColor(transaction.category)}>
                                {transaction.category}
                              </Badge>
                            </Td>
                            <Td isNumeric>
                              <Text color={transaction.type === 'income' ? 'green.500' : 'red.500'}>
                                {transaction.type === 'income' ? '+' : '-'}${transaction.amount}
                              </Text>
                            </Td>
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

                <GlassCard title="Spending by Category">
                  <VStack spacing={3} align="start">
                    {(financialData.spendingByCategory || []).map((category, index) => (
                      <HStack key={category.name} justify="space-between" w="100%">
                        <HStack>
                          <Box w="3" h="3" borderRadius="full" bg={COLORS[index % COLORS.length]} />
                          <Text fontSize="sm">{category.name}</Text>
                        </HStack>
                        <HStack>
                          <Text fontSize="sm" fontWeight="600">
                            ${category.amount.toLocaleString()}
                          </Text>
                          <Text fontSize="xs" color={subText}>
                            {category.percentage}%
                          </Text>
                        </HStack>
                      </HStack>
                    ))}
                  </VStack>
                </GlassCard>
              </SimpleGrid>
            </TabPanel>

            {/* Analytics Tab */}
            <TabPanel p={0}>
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                <GlassCard title="Income vs Expenses" colSpan={{ base: 1, lg: 2 }}>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={financialData.cashFlowHistory || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <RTooltip />
                      <Bar dataKey="income" fill="#38A169" name="Income" />
                      <Bar dataKey="expenses" fill="#E53E3E" name="Expenses" />
                    </BarChart>
                  </ResponsiveContainer>
                </GlassCard>

                <GlassCard title="Net Worth Trend">
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={financialData.netWorthHistory || []}>
                      <Line type="monotone" dataKey="value" stroke="#3182CE" strokeWidth={2} />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <RTooltip />
                    </LineChart>
                  </ResponsiveContainer>
                </GlassCard>

                <GlassCard title="Financial Health Score">
                  <VStack spacing={4}>
                    <Progress
                      value={insights.financialHealthScore || 0}
                      colorScheme={
                        (insights.financialHealthScore || 0) > 80 ? 'green' :
                        (insights.financialHealthScore || 0) > 60 ? 'yellow' : 'red'
                      }
                      size="lg"
                      w="100%"
                      borderRadius="full"
                    />
                    <Text fontSize="2xl" fontWeight="bold">
                      {insights.financialHealthScore || 0}/100
                    </Text>
                    <Text fontSize="sm" color={subText} textAlign="center">
                      {insights.healthAssessment || 'Based on your financial metrics'}
                    </Text>
                  </VStack>
                </GlassCard>
              </SimpleGrid>
            </TabPanel>

            {/* Calculator Tab */}
            <TabPanel p={0}>
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                <GlassCard title="Savings Goal Calculator">
                  <VStack spacing={4}>
                    <FormControl>
                      <FormLabel>Goal Amount</FormLabel>
                      <NumberInput>
                        <NumberInputField placeholder="e.g., 50000" />
                      </NumberInput>
                    </FormControl>
                    <FormControl>
                      <FormLabel>Monthly Contribution</FormLabel>
                      <NumberInput>
                        <NumberInputField placeholder="e.g., 1000" />
                      </NumberInput>
                    </FormControl>
                    <FormControl>
                      <FormLabel>Expected Return (%)</FormLabel>
                      <NumberInput defaultValue={7}>
                        <NumberInputField />
                      </NumberInput>
                    </FormControl>
                    <Button
                      colorScheme="blue"
                      w="100%"
                      onClick={() =>
                        calculateSavings({
                          goal: 50000,
                          monthly: 1000,
                          returnRate: 7,
                        })
                      }
                    >
                      Calculate
                    </Button>

                    {calculations.result && (
                      <VStack spacing={2} mt={4} p={4} bg={chipBg} borderRadius="md" w="100%">
                        <Text fontWeight="600">Results:</Text>
                        <Text fontSize="sm">Time to goal: {calculations.result.years} years</Text>
                        <Text fontSize="sm">Total contributions: ${calculations.result.totalContributions}</Text>
                        <Text fontSize="sm">Total interest: ${calculations.result.totalInterest}</Text>
                      </VStack>
                    )}
                  </VStack>
                </GlassCard>

                <GlassCard title="Debt Payoff Calculator">
                  <VStack spacing={4}>
                    <FormControl>
                      <FormLabel>Debt Amount</FormLabel>
                      <NumberInput>
                        <NumberInputField placeholder="e.g., 10000" />
                      </NumberInput>
                    </FormControl>
                    <FormControl>
                      <FormLabel>Interest Rate (%)</FormLabel>
                      <NumberInput defaultValue={15}>
                        <NumberInputField />
                      </NumberInput>
                    </FormControl>
                    <FormControl>
                      <FormLabel>Monthly Payment</FormLabel>
                      <NumberInput>
                        <NumberInputField placeholder="e.g., 300" />
                      </NumberInput>
                    </FormControl>
                    <Button colorScheme="blue" w="100%" variant="outline">
                      Calculate Payoff
                    </Button>
                  </VStack>
                </GlassCard>

                <GlassCard title="Investment Calculator" colSpan={{ base: 1, lg: 2 }}>
                  <VStack spacing={4}>
                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} w="100%">
                      <FormControl>
                        <FormLabel>Initial Investment</FormLabel>
                        <NumberInput>
                          <NumberInputField placeholder="e.g., 10000" />
                        </NumberInput>
                      </FormControl>
                      <FormControl>
                        <FormLabel>Monthly Contribution</FormLabel>
                        <NumberInput>
                          <NumberInputField placeholder="e.g., 500" />
                        </NumberInput>
                      </FormControl>
                      <FormControl>
                        <FormLabel>Expected Return (%)</FormLabel>
                        <NumberInput defaultValue={8}>
                          <NumberInputField />
                        </NumberInput>
                      </FormControl>
                    </SimpleGrid>
                    <FormControl>
                      <FormLabel>Time Period (years)</FormLabel>
                      <NumberInput defaultValue={20}>
                        <NumberInputField />
                      </NumberInput>
                    </FormControl>
                    <Button colorScheme="green" w="100%">
                      Project Growth
                    </Button>
                  </VStack>
                </GlassCard>
              </SimpleGrid>
            </TabPanel>

            {/* AI Insights Tab (UNCHANGED) */}
            <TabPanel p={0}>
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                <GlassCard title="🤖 AI Financial Advisor" colSpan={{ base: 1, lg: 2 }}>
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

                    {/* Keep this as requested */}
                    <Button
                      as={RouterLink}
                      to="/wealth/advisor"
                      leftIcon={<FaRobot />}
                      colorScheme="purple"
                    >
                      Generate Personalized Advice
                    </Button>
                  </VStack>
                </GlassCard>

                <GlassCard title="Optimization Opportunities">
                  <VStack spacing={3} align="start">
                    {(insights.optimizations || []).map((opt, index) => (
                      <HStack key={index} w="100%" p={3} bg={chipBg} borderRadius="md">
                        <FaLightbulb color="orange" />
                        <Box>
                          <Text fontSize="sm" fontWeight="600">{opt.area}</Text>
                          <Text fontSize="xs" color={subText}>{opt.suggestion}</Text>
                        </Box>
                      </HStack>
                    ))}
                  </VStack>
                </GlassCard>

                <GlassCard title="Risk Assessment">
                  <VStack spacing={3} align="start">
                    {(insights.risks || []).map((risk, index) => (
                      <HStack key={index} w="100%" justify="space-between">
                        <Text fontSize="sm">{risk.type}</Text>
                        <Badge colorScheme={risk.level === 'high' ? 'red' : risk.level === 'medium' ? 'yellow' : 'green'}>
                          {risk.level}
                        </Badge>
                      </HStack>
                    ))}
                  </VStack>
                </GlassCard>
              </SimpleGrid>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>

      {/* Add Transaction Modal */}
      <AddTransactionModal
        isOpen={isOpen}
        onClose={onClose}
        onAddTransaction={handleAddTransaction}
        transactionType={transactionType}
        setTransactionType={setTransactionType}
      />
    </Box>
  );
}

// Add Transaction Modal Component
function AddTransactionModal({ isOpen, onClose, onAddTransaction, transactionType, setTransactionType }) {
  const [transaction, setTransaction] = useState({
    amount: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = () => {
    onAddTransaction(transaction);
    setTransaction({ amount: '', description: '', category: '', date: new Date().toISOString().split('T')[0] });
  };

  const transactionCategories = {
    income: ['Salary', 'Freelance', 'Investment', 'Business', 'Other'],
    expense: ['Housing', 'Food', 'Transportation', 'Entertainment', 'Healthcare', 'Utilities', 'Other'],
    investment: ['Stocks', 'Bonds', 'Real Estate', 'Crypto', 'Retirement', 'Other'],
    debt: ['Credit Card', 'Mortgage', 'Car Loan', 'Student Loan', 'Personal Loan', 'Other']
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add New Transaction</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Transaction Type</FormLabel>
              <Select
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value)}
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
                <option value="investment">Investment</option>
                <option value="debt">Debt Payment</option>
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Amount</FormLabel>
              <NumberInput>
                <NumberInputField
                  placeholder="0.00"
                  value={transaction.amount}
                  onChange={(e) => setTransaction({ ...transaction, amount: e.target.value })}
                />
              </NumberInput>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Description</FormLabel>
              <Input
                placeholder="Enter description"
                value={transaction.description}
                onChange={(e) => setTransaction({ ...transaction, description: e.target.value })}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Category</FormLabel>
              <Select
                placeholder="Select category"
                value={transaction.category}
                onChange={(e) => setTransaction({ ...transaction, category: e.target.value })}
              >
                {(transactionCategories[transactionType] || []).map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Date</FormLabel>
              <Input
                type="date"
                value={transaction.date}
                onChange={(e) => setTransaction({ ...transaction, date: e.target.value })}
              />
            </FormControl>

            <Button colorScheme="blue" w="100%" onClick={handleSubmit}>
              Add Transaction
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

// Helper functions
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const getCategoryColor = (category) => {
  const colors = {
    Salary: 'green',
    Freelance: 'blue',
    Investment: 'purple',
    Housing: 'red',
    Food: 'orange',
    Transportation: 'yellow',
    Entertainment: 'pink',
    Stocks: 'teal',
    Bonds: 'cyan',
    'Credit Card': 'red',
  };
  return colors[category] || 'gray';
};
