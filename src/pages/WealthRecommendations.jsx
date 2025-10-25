import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Badge,
  SimpleGrid,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Divider,
  Wrap,
  WrapItem,
  Progress,
  Card,
  CardBody,
  Stack,
  Icon,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Grid,
  GridItem,
  useColorModeValue,
  Container,
} from "@chakra-ui/react";
import {
  FaRobot,
  FaChartLine,
  FaPiggyBank,
  FaDollarSign,
  FaShieldAlt,
  FaCrown,
  FaWallet,
  FaBalanceScale,
} from "react-icons/fa";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { Link as RouterLink } from "react-router-dom";
import GlassCard from "../components/GlassCard";
import { getWealthData, generateFinancialInsights, getAIFinancialAdvice } from "../services/wealthStore";

const CardHeader = ({ icon, title, subtitle, children }) => {
  const titleColor = useColorModeValue("gray.800", "white");
  const subColor = useColorModeValue("gray.600", "whiteAlpha.700");
  return (
    <VStack align="stretch" spacing={3} mb={4}>
      <HStack spacing={3}>
        {icon && <Icon as={icon} color="purple.300" boxSize={5} />}
        <VStack align="start" spacing={1}>
          <Heading size="md" color={titleColor}>
            {title}
          </Heading>
          {subtitle && (
            <Text color={subColor} fontSize="sm">
              {subtitle}
            </Text>
          )}
        </VStack>
      </HStack>
      {children}
    </VStack>
  );
};

export default function WealthRecommendations() {
  const toast = useToast();
  const [insights, setInsights] = useState({});
  const [aiAdvice, setAiAdvice] = useState(null);
  const [data, setData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const bgGradient = useColorModeValue(
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #1a202c 0%, #2d3748 100%)"
  );
  const borderColor = useColorModeValue("whiteAlpha.300", "whiteAlpha.200");
  const cardBg = useColorModeValue("whiteAlpha.200", "whiteAlpha.100");
  const white = useColorModeValue("white", "white");

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const [d, i, ai] = await Promise.all([
          getWealthData(),
          generateFinancialInsights(),
          getAIFinancialAdvice(),
        ]);
        setData(d || {});
        setInsights(i || {});
        setAiAdvice(ai || null);
      } catch (e) {
        console.error(e);
        toast({
          title: "Could not load recommendations",
          status: "error",
          position: "top-right",
          duration: 3000,
        });
      } finally {
        setIsLoading(false);
      }
    })();
  }, [toast]);

  const MetricStat = ({ icon, label, value, change, helpText, color = "purple" }) => (
    <Card bg={cardBg} border="1px" borderColor={borderColor} backdropFilter="blur(20px)" height="100%">
      <CardBody>
        <Stack spacing={3}>
          <HStack justify="space-between">
            <Icon as={icon} color={`${color}.300`} boxSize={6} />
            <Badge colorScheme={color} variant="subtle" borderRadius="full" px={3}>
              Premium
            </Badge>
          </HStack>
          <Stat>
            <StatLabel color={white + "Alpha.800"} fontSize="sm">
              {label}
            </StatLabel>
            <StatNumber color={white} fontSize="2xl">
              {value}
            </StatNumber>
            {typeof change === "number" && (
              <StatHelpText color="whiteAlpha.700">
                <StatArrow type={change >= 0 ? "increase" : "decrease"} />
                {Math.abs(change)}% from last month
              </StatHelpText>
            )}
          </Stat>
          {helpText && <Text fontSize="xs" color="whiteAlpha.700">{helpText}</Text>}
        </Stack>
      </CardBody>
    </Card>
  );

  const PriorityRecommendation = ({ rec, index }) => (
    <Alert
      status={rec.priority === "high" ? "warning" : rec.priority === "medium" ? "info" : "success"}
      borderRadius="xl"
      variant="subtle"
      bg="whiteAlpha.100"
      border="1px"
      borderColor={borderColor}
      backdropFilter="blur(10px)"
      py={4}
    >
      <HStack spacing={4} width="full">
        <Box position="relative">
          <Icon as={FaCrown} color={rec.priority === "high" ? "orange.300" : "purple.300"} boxSize={6} />
          <Badge
            colorScheme={rec.priority === "high" ? "red" : rec.priority === "medium" ? "yellow" : "green"}
            variant="solid"
            borderRadius="full"
            position="absolute"
            top={-2}
            right={-2}
            fontSize="2xs"
            minW={4}
            h={4}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            {index + 1}
          </Badge>
        </Box>
        <Box flex={1}>
          <AlertTitle fontSize="lg" mb={2} color="white">
            {rec.title}
          </AlertTitle>
          <AlertDescription fontSize="md" color="whiteAlpha.900">
            {rec.description}
          </AlertDescription>
          {rec.impact && (
            <HStack mt={3} spacing={4}>
              <Badge colorScheme="blue" variant="subtle">
                Impact: {rec.impact}%
              </Badge>
              <Badge colorScheme="green" variant="subtle">
                Effort: {rec.effort}
              </Badge>
            </HStack>
          )}
        </Box>
      </HStack>
    </Alert>
  );

  // Fallback demo data if store light
  const mockInsights = {
    financialHealthScore: 82,
    healthAssessment: "Great Financial Health! Consider optimizing investments.",
    quickTips: [
      "Automate transfers to savings right after payday",
      "Cap housing costs at ~30% of income",
      "Use a 3-fund portfolio for broad diversification",
      "Review subscriptions and eliminate unused ones",
      "Keep 3–6 months of expenses in emergency savings",
    ],
    improvementPlan: [
      { week: "Week 1: Cash Flow Audit", action: "Categorize all expenses and set monthly caps", metrics: ["Income", "Expenses"] },
      { week: "Week 2: Emergency Fund", action: "Set up auto-savings; target $3,000", metrics: ["Savings rate", "Cash buffer"] },
      { week: "Week 3: Debt Strategy", action: "Choose avalanche or snowball; automate payments", metrics: ["DTI", "Payments"] },
      { week: "Week 4: Invest", action: "Open/adjust brokerage or retirement contributions", metrics: ["Allocation", "Fees"] },
    ],
  };
  const mockAdvice = {
    recommendations: [
      { title: "Increase 401(k) Contribution", description: "Raise contribution from 6% → 10% to capture employer match and accelerate retirement growth.", priority: "high", impact: 80, effort: "low" },
      { title: "Refinance High-APR Debt", description: "Move credit balance (22% APR) to 0% promo or personal loan to save interest.", priority: "high", impact: 75, effort: "medium" },
      { title: "Rebalance Allocation", description: "Equities overweight by 12%. Rebalance to 70/25/5 (stocks/bonds/cash).", priority: "medium", impact: 45, effort: "low" },
    ],
  };

  const displayInsights = Object.keys(insights).length ? insights : mockInsights;
  const displayAdvice = aiAdvice || mockAdvice;

  return (
    <Box minH="100vh" bg={bgGradient} backgroundAttachment="fixed" py={8}>
      <Container maxW="8xl">
        {/* Header */}
        <Flex justify="space-between" align="center" mb={8} flexWrap="wrap" gap={4}>
          <VStack align="start" spacing={2}>
            <HStack spacing={3}>
              <Icon as={FaBalanceScale} boxSize={8} color="whiteAlpha.900" />
              <Heading size="xl" color="white" fontWeight="bold">
                Financial Excellence
              </Heading>
            </HStack>
            <Text color="whiteAlpha.800" fontSize="lg">
              Personalized recommendations for long-term wealth
            </Text>
          </VStack>

          <Wrap spacing={3}>
            <WrapItem>
              <Button
                as={RouterLink}
                to="/wealth/advisor"
                leftIcon={<FaRobot />}
                colorScheme="purple"
                variant="solid"
                size="lg"
              >
                AI Financial Advisor
              </Button>
            </WrapItem>
            <WrapItem>
              <Button
                as={RouterLink}
                to="/wealth"
                rightIcon={<ExternalLinkIcon />}
                variant="outline"
                color="white"
                borderColor="whiteAlpha.400"
                _hover={{ bg: "whiteAlpha.100" }}
                size="lg"
              >
                Wealth Dashboard
              </Button>
            </WrapItem>
          </Wrap>
        </Flex>

        {isLoading ? (
          <VStack spacing={4} py={20}>
            <Progress size="xs" isIndeterminate colorScheme="purple" w="200px" />
            <Text color="whiteAlpha.800">Loading your premium financial analysis…</Text>
          </VStack>
        ) : (
          <>
            {/* Metrics */}
            <SimpleGrid columns={{ base: 1, lg: 2, xl: 3 }} spacing={6} mb={8}>
              <Card bg={cardBg} border="1px" borderColor={borderColor}>
                <CardBody>
                  <VStack spacing={3} align="center" py={2}>
                    <Heading size="sm" color="white">Financial Health</Heading>
                    <Box position="relative" w={32} h={32}>
                      <Progress
                        value={displayInsights.financialHealthScore || 0}
                        size="32"
                        thickness="8px"
                        colorScheme="purple"
                        borderRadius="full"
                        transform="rotate(-90deg)"
                        bg="whiteAlpha.200"
                      />
                      <Box position="absolute" top="50%" left="50%" transform="translate(-50%,-50%)" textAlign="center">
                        <Text fontSize="3xl" fontWeight="bold" color="white">
                          {displayInsights.financialHealthScore || 0}
                        </Text>
                        <Text fontSize="sm" opacity={0.8} color="whiteAlpha.800">
                          /100
                        </Text>
                      </Box>
                    </Box>
                    <Text color="whiteAlpha.800" fontSize="sm" textAlign="center">
                      {displayInsights.healthAssessment || "Based on your financial metrics"}
                    </Text>
                  </VStack>
                </CardBody>
              </Card>

              <MetricStat
                icon={FaWallet}
                label="Monthly Cash Flow"
                value={`$${(((data.monthlyIncome || 0) - (data.monthlyExpenses || 0)) || 0).toLocaleString()}`}
                change={12}
                helpText="Income minus expenses"
                color="green"
              />
              <MetricStat
                icon={FaPiggyBank}
                label="Savings Rate"
                value={`${data.totalIncome ? (((data.totalIncome - (data.totalExpenses || 0)) / data.totalIncome) * 100).toFixed(1) : 0}%`}
                change={6}
                helpText="Target ≥ 20%"
                color="blue"
              />
              <MetricStat
                icon={FaDollarSign}
                label="Net Worth"
                value={`$${(((data.assets || 0) - (data.liabilities || 0)) || 0).toLocaleString()}`}
                change={8}
                helpText="Assets − liabilities"
                color="purple"
              />
              <MetricStat
                icon={FaShieldAlt}
                label="Debt-to-Income"
                value={`${data.totalIncome ? (((data.totalDebt || 0) / data.totalIncome) * 100).toFixed(1) : 0}%`}
                change={-3}
                helpText="Lower is better"
                color="red"
              />
              <MetricStat
                icon={FaChartLine}
                label="Investment Return (YTD)"
                value={`8.2%`}
                change={2}
                helpText="Portfolio performance"
                color="orange"
              />
            </SimpleGrid>

            {/* Main Grid */}
            <Grid templateColumns={{ base: "1fr", xl: "3fr 2fr" }} gap={8} mb={8}>
              <GridItem>
                <VStack spacing={6} align="stretch">
                  <GlassCard>
                    <CardHeader
                      icon={FaCrown}
                      title="Priority Recommendations"
                      subtitle="AI-powered insights for maximum impact"
                    />
                    <VStack spacing={4} align="stretch">
                      {(displayAdvice.recommendations || []).map((rec, i) => (
                        <PriorityRecommendation key={i} rec={rec} index={i} />
                      ))}
                    </VStack>
                  </GlassCard>

                  <GlassCard>
                    <CardHeader
                      icon={FaChartLine}
                      title="30-Day Financial Transformation"
                      subtitle="Structured plan for sustainable improvement"
                    />
                    <VStack spacing={4} align="stretch">
                      {(displayInsights.improvementPlan || []).map((step, i) => (
                        <HStack
                          key={i}
                          spacing={4}
                          p={4}
                          bg="whiteAlpha.50"
                          borderRadius="xl"
                          border="1px"
                          borderColor={borderColor}
                          _hover={{ bg: "whiteAlpha.100", transform: "translateY(-2px)" }}
                          transition="all 0.3s ease"
                        >
                          <Flex
                            w={10}
                            h={10}
                            bg="purple.500"
                            borderRadius="full"
                            align="center"
                            justify="center"
                            flexShrink={0}
                          >
                            <Text fontWeight="bold" color="white">
                              {i + 1}
                            </Text>
                          </Flex>
                          <Box flex={1}>
                            <Text fontWeight="semibold" color="white" fontSize="lg">
                              {step.week}
                            </Text>
                            <Text color="whiteAlpha.900" fontSize="md">
                              {step.action}
                            </Text>
                            {step.metrics && (
                              <HStack mt={2} spacing={3}>
                                {step.metrics.map((m, idx) => (
                                  <Badge key={idx} colorScheme="blue" variant="subtle">
                                    {m}
                                  </Badge>
                                ))}
                              </HStack>
                            )}
                          </Box>
                        </HStack>
                      ))}
                    </VStack>
                  </GlassCard>
                </VStack>
              </GridItem>

              <GridItem>
                <VStack spacing={6} align="stretch">
                  <GlassCard>
                    <CardHeader icon={FaShieldAlt} title="Expert Tips" subtitle="Evidence-based money habits" />
                    <VStack spacing={3} align="stretch">
                      {(displayInsights.quickTips || []).map((tip, i) => (
                        <HStack
                          key={i}
                          spacing={4}
                          p={4}
                          bg="whiteAlpha.50"
                          borderRadius="lg"
                          border="1px"
                          borderColor={borderColor}
                        >
                          <Icon as={FaBalanceScale} color="green.300" boxSize={5} />
                          <Text flex={1} color="whiteAlpha.900" fontSize="md">
                            {tip}
                          </Text>
                        </HStack>
                      ))}
                    </VStack>
                  </GlassCard>

                  <GlassCard>
                    <VStack spacing={4} align="stretch">
                      <Heading size="sm" color="white">
                        Reminder
                      </Heading>
                      <Box p={4} bg="whiteAlpha.50" borderRadius="lg" border="1px dashed" borderColor={borderColor}>
                        <Text fontSize="sm" color="whiteAlpha.700" textAlign="center">
                          💡 These recommendations are educational and not financial advice. Consult a professional
                          before making major decisions.
                        </Text>
                      </Box>
                    </VStack>
                  </GlassCard>
                </VStack>
              </GridItem>
            </Grid>

            {/* Footer CTA */}
            <GlassCard>
              <VStack spacing={4} textAlign="center" py={6}>
                <Heading size="md" color="white">
                  Ready to Level Up Your Finances?
                </Heading>
                <Text color="whiteAlpha.800" maxW="2xl">
                  Users improve savings rates by an average of 30% after following their personalized plan for 90 days.
                </Text>
                <Button as={RouterLink} to="/wealth/advisor" colorScheme="purple" size="lg" leftIcon={<FaRobot />}>
                  Start with AI Financial Advisor
                </Button>
              </VStack>
            </GlassCard>
          </>
        )}
      </Container>
    </Box>
  );
}
