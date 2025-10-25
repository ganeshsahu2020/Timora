// src/pages/SleepRecommendations.jsx
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
  Tooltip,
} from "@chakra-ui/react";
import {
  FaRobot,
  FaBed,
  FaHeart,
  FaBrain,
  FaChartLine,
  FaClock,
  FaLeaf,
  FaShieldAlt,
  FaStar,
  FaCrown,
} from "react-icons/fa";
import { GiNightSleep, GiAlarmClock, GiHealthNormal } from "react-icons/gi";
import { ExternalLinkIcon, ChevronLeftIcon } from "@chakra-ui/icons";
import { Link as RouterLink } from "react-router-dom";
import GlassCard from "../components/GlassCard";
import { getSleepData, generateSleepInsights, getAISleepAdvice } from "../services/sleepStore";

// Small header block to standardize section headings (mirrors AISleepCoach vibe)
const CardHeader = ({ icon, title, subtitle, children }) => (
  <VStack align="stretch" spacing={3} mb={4}>
    <HStack spacing={3}>
      {icon && <Icon as={icon} color="purple.300" boxSize={5} />}
      <VStack align="start" spacing={1}>
        <Heading size="md" color="white">
          {title}
        </Heading>
        {subtitle && (
          <Text color="whiteAlpha.700" fontSize="sm">
            {subtitle}
          </Text>
        )}
      </VStack>
    </HStack>
    {children}
  </VStack>
);

export default function SleepRecommendations() {
  const toast = useToast();
  const [insights, setInsights] = useState({});
  const [aiAdvice, setAiAdvice] = useState(null);
  const [data, setData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Luxe theming (aligned to AISleepCoach)
  const bgGradient = useColorModeValue(
    "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
    "linear-gradient(135deg, #1a202c 0%, #2d3748 100%)"
  );
  const cardBg = useColorModeValue("whiteAlpha.700", "whiteAlpha.100");
  const panelBg = useColorModeValue("whiteAlpha.800", "blackAlpha.300");
  const borderColor = useColorModeValue("blackAlpha.200", "whiteAlpha.300");
  const textPrimary = useColorModeValue("gray.900", "white");
  const textSecondary = useColorModeValue("gray.700", "gray.300");

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const [d, i, ai] = await Promise.all([
          getSleepData(),
          generateSleepInsights(),
          getAISleepAdvice(),
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

  // Metric cards
  const MetricStat = ({ icon, label, value, change, helpText, color = "purple" }) => (
    <Card
      bg={cardBg}
      border="1px"
      borderColor={borderColor}
      backdropFilter="blur(16px)"
      height="100%"
      shadow="md"
      _hover={{ shadow: "lg", transform: "translateY(-2px)" }}
      transition="all 0.2s ease"
    >
      <CardBody>
        <Stack spacing={3}>
          <HStack justify="space-between">
            <Icon as={icon} color={`${color}.400`} boxSize={6} />
            <Badge colorScheme={color} variant="subtle" borderRadius="full" px={3}>
              Insight
            </Badge>
          </HStack>
          <Stat>
            <StatLabel color={textSecondary} fontSize="sm">
              {label}
            </StatLabel>
            <StatNumber color={textPrimary} fontSize="2xl">
              {value}
            </StatNumber>
            {typeof change === "number" && (
              <StatHelpText color={textSecondary}>
                <StatArrow type={change >= 0 ? "increase" : "decrease"} />
                {Math.abs(change)}% from last week
              </StatHelpText>
            )}
          </Stat>
          {helpText && (
            <Text fontSize="xs" color={textSecondary}>
              {helpText}
            </Text>
          )}
        </Stack>
      </CardBody>
    </Card>
  );

  const PriorityRecommendation = ({ rec, index }) => (
    <Alert
      status={rec.priority === "high" ? "warning" : rec.priority === "medium" ? "info" : "success"}
      borderRadius="xl"
      variant="subtle"
      bg={panelBg}
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
          <AlertTitle fontSize="lg" mb={2} color={textPrimary}>
            {rec.title}
          </AlertTitle>
          <AlertDescription fontSize="md" color={textSecondary}>
            {rec.description}
          </AlertDescription>
          {(rec.impact || rec.effort) && (
            <HStack mt={3} spacing={4}>
              {rec.impact && (
                <Badge colorScheme="blue" variant="subtle">
                  Impact: {rec.impact}%
                </Badge>
              )}
              {rec.effort && (
                <Badge colorScheme="green" variant="subtle">
                  Effort: {rec.effort}
                </Badge>
              )}
            </HStack>
          )}
        </Box>
      </HStack>
    </Alert>
  );

  // ---- Mock fallback data (used if store is empty) --------------------------
  const mockInsights = {
    sleepScore: 76,
    sleepAssessment: "Better than 65% of users your age",
    quickTips: [
      "Maintain a consistent sleep schedule (even weekends).",
      "Avoid caffeine and heavy meals 3 hours before bed.",
      "Keep the bedroom at 65–68°F (18–20°C).",
      "Limit screens during your last hour.",
      "Try a 10-minute wind-down routine.",
    ],
    disorderRisks: [
      {
        condition: "Sleep Apnea",
        risk: "medium",
        symptoms: "Loud snoring, daytime fatigue, morning headaches",
        recommendation: "Consider a sleep study consultation.",
      },
      {
        condition: "Insomnia",
        risk: "low",
        symptoms: "Difficulty falling asleep, frequent awakenings",
        recommendation: "Stick to core sleep hygiene practices.",
      },
    ],
    improvementPlan: [
      {
        week: "Week 1 — Foundation",
        action: "Establish a consistent bedtime within a 30-minute window.",
        metrics: ["Bedtime consistency", "Wake-up time"],
      },
      {
        week: "Week 2 — Environment",
        action: "Optimize bedroom: cool, dark, quiet; reduce light spikes.",
        metrics: ["Room temperature", "Light exposure"],
      },
      {
        week: "Week 3 — Routine",
        action: "Add a relaxing pre-sleep routine (10–20 min).",
        metrics: ["Wind-down time", "Evening screens"],
      },
    ],
  };
  const mockAiAdvice = {
    recommendations: [
      {
        title: "Tighten Sleep Schedule",
        description:
          "Your bedtime varies ~2 hours. Keep it within ±30 minutes to lift deep sleep and reduce wake-ups.",
        priority: "high",
        impact: 85,
        effort: "medium",
      },
      {
        title: "Reduce Late-Evening Light",
        description:
          "Screen use in the last hour detected. Shift to audio or paper; use warm, dim lighting.",
        priority: "medium",
        impact: 65,
        effort: "low",
      },
      {
        title: "Stabilize Bedroom Temp",
        description: "Hold 65–68°F and avoid spikes that can fragment sleep.",
        priority: "medium",
        impact: 55,
        effort: "low",
      },
    ],
  };

  const displayInsights = Object.keys(insights || {}).length ? insights : mockInsights;
  const displayAiAdvice = aiAdvice || mockAiAdvice;

  return (
    <Box minH="100vh" bg={bgGradient} backgroundAttachment="fixed" py={8}>
      <Container maxW="8xl" px={{ base: 4, md: 8 }}>
        {/* Header / Nav */}
        <Flex justify="space-between" align="center" mb={8} flexWrap="wrap" gap={4}>
          <VStack align="start" spacing={2}>
            <HStack spacing={3}>
              <Icon as={GiNightSleep} boxSize={8} color="purple.500" />
              <VStack align="start" spacing={0}>
                <Heading size="xl" color={textPrimary} fontWeight="bold">
                  Sleep Excellence
                </Heading>
                <Text color={textSecondary} fontSize="lg">
                  Personalized recommendations for optimal sleep health
                </Text>
              </VStack>
            </HStack>
          </VStack>

          <Wrap spacing={3}>
            <WrapItem>
              <Button
                as={RouterLink}
                to="/sleep"
                rightIcon={<ExternalLinkIcon />}
                variant="outline"
                color={textPrimary}
                borderColor={borderColor}
                _hover={{ bg: panelBg }}
                size="lg"
              >
                Sleep Dashboard
              </Button>
            </WrapItem>
            <WrapItem>
              <Button as={RouterLink} to="/sleep/coach" leftIcon={<FaRobot />} colorScheme="purple" size="lg">
                AI Sleep Coach
              </Button>
            </WrapItem>
          </Wrap>
        </Flex>

        {isLoading ? (
          <VStack spacing={4} py={20}>
            <Progress size="xs" isIndeterminate colorScheme="purple" w="240px" />
            <Text color={textSecondary}>Loading your premium sleep analysis…</Text>
          </VStack>
        ) : (
          <>
            {/* KPI / Metrics */}
            <SimpleGrid columns={{ base: 1, lg: 2, xl: 3 }} spacing={6} mb={8}>
              {/* Score donut look-alike */}
              <GlassCard>
                <CardHeader icon={FaStar} title="Sleep Quality Score">
                  <VStack spacing={4} align="center" py={2}>
                    <Box position="relative" w={32} h={32}>
                      <Progress
                        value={displayInsights.sleepScore || 0}
                        size="32"
                        thickness="8px"
                        colorScheme="purple"
                        borderRadius="full"
                        transform="rotate(-90deg)"
                        bg={panelBg}
                      />
                      <Box
                        position="absolute"
                        top="50%"
                        left="50%"
                        transform="translate(-50%, -50%)"
                        textAlign="center"
                      >
                        <Text fontSize="3xl" fontWeight="bold" color={textPrimary}>
                          {displayInsights.sleepScore || 0}
                        </Text>
                        <Text fontSize="sm" opacity={0.8} color={textSecondary}>
                          /100
                        </Text>
                      </Box>
                    </Box>
                    <VStack spacing={1}>
                      <Text fontSize="lg" fontWeight="semibold" color={textPrimary}>
                        {displayInsights.sleepScore >= 80
                          ? "Excellent"
                          : displayInsights.sleepScore >= 60
                          ? "Good"
                          : displayInsights.sleepScore >= 40
                          ? "Fair"
                          : "Needs Improvement"}
                      </Text>
                      <Text fontSize="sm" color={textSecondary} textAlign="center">
                        {displayInsights.sleepAssessment || "Personalized sleep assessment"}
                      </Text>
                    </VStack>
                  </VStack>
                </CardHeader>
              </GlassCard>

              <MetricStat
                icon={FaClock}
                label="Avg. Sleep Duration"
                value={data?.averageDuration || "7.2h"}
                change={12}
                helpText="Ideal range: 7–9 hours"
                color="blue"
              />
              <MetricStat
                icon={FaBed}
                label="Sleep Efficiency"
                value={`${data?.efficiency ?? 94}%`}
                change={8}
                helpText="Time asleep vs time in bed"
                color="green"
              />
              <MetricStat
                icon={GiAlarmClock}
                label="Wake-up Consistency"
                value={`${data?.consistency ?? 86}%`}
                change={15}
                helpText="Regular wake-up times"
                color="orange"
              />
              <MetricStat
                icon={FaHeart}
                label="Resting Heart Rate"
                value={`${data?.lastNight?.restingHR ?? 58} bpm`}
                change={-5}
                helpText="During sleep periods"
                color="red"
              />
              <MetricStat
                icon={FaBrain}
                label="Deep Sleep Ratio"
                value={`${
                  displayInsights?.deepRatio ??
                  (data?.lastNight?.deepSleep ? "—" : "22%")
                }`}
                change={3}
                helpText="Of total sleep time"
                color="purple"
              />
            </SimpleGrid>

            {/* Main Grid */}
            <Grid templateColumns={{ base: "1fr", xl: "3fr 2fr" }} gap={8} mb={8}>
              <GridItem>
                <VStack spacing={6} align="stretch">
                  {/* AI priority recs */}
                  <GlassCard>
                    <CardHeader
                      icon={FaCrown}
                      title="Priority Recommendations"
                      subtitle="AI-powered insights for maximum impact"
                    />
                    <VStack spacing={4} align="stretch">
                      {(displayAiAdvice.recommendations || []).map((rec, i) => (
                        <PriorityRecommendation key={i} rec={rec} index={i} />
                      ))}
                    </VStack>
                  </GlassCard>

                  {/* 14-day plan */}
                  <GlassCard>
                    <CardHeader
                      icon={FaChartLine}
                      title="14-Day Sleep Transformation"
                      subtitle="Structured plan for sustainable improvement"
                    />
                    <VStack spacing={4} align="stretch">
                      {(displayInsights.improvementPlan || []).map((step, i) => (
                        <HStack
                          key={i}
                          spacing={4}
                          p={4}
                          bg={panelBg}
                          borderRadius="xl"
                          border="1px"
                          borderColor={borderColor}
                          _hover={{ transform: "translateY(-2px)" }}
                          transition="all 0.2s ease"
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
                            <Text fontWeight="semibold" color={textPrimary} fontSize="lg">
                              {step.week}
                            </Text>
                            <Text color={textSecondary} fontSize="md">
                              {step.action}
                            </Text>
                            {step.metrics && (
                              <HStack mt={2} spacing={3} flexWrap="wrap">
                                {step.metrics.map((metric, idx) => (
                                  <Badge key={idx} colorScheme="blue" variant="subtle">
                                    {metric}
                                  </Badge>
                                ))}
                              </HStack>
                            )}
                          </Box>
                          <Icon as={FaLeaf} color="green.400" boxSize={5} />
                        </HStack>
                      ))}
                    </VStack>
                  </GlassCard>
                </VStack>
              </GridItem>

              {/* Right rail */}
              <GridItem>
                <VStack spacing={6} align="stretch">
                  {/* Quick tips */}
                  <GlassCard>
                    <CardHeader icon={FaShieldAlt} title="Expert Sleep Tips" subtitle="Evidence-based practices" />
                    <VStack spacing={3} align="stretch">
                      {(displayInsights.quickTips || []).map((tip, i) => (
                        <HStack key={i} spacing={4} p={4} bg={panelBg} borderRadius="lg" border="1px" borderColor={borderColor}>
                          <Icon as={GiHealthNormal} color="green.300" boxSize={5} />
                          <Text flex={1} color={textPrimary} fontSize="md">
                            {tip}
                          </Text>
                        </HStack>
                      ))}
                    </VStack>
                  </GlassCard>

                  {/* Risk screen */}
                  <GlassCard>
                    <CardHeader icon={FaShieldAlt} title="Health Risk Screening" subtitle="Professional guidance" />
                    <VStack spacing={4} align="stretch">
                      {(displayInsights.disorderRisks || []).map((risk, i) => (
                        <Card key={i} bg={panelBg} border="1px" borderColor={borderColor}>
                          <CardBody>
                            <Stack spacing={3}>
                              <HStack justify="space-between" align="start">
                                <Text fontWeight="bold" fontSize="lg" color={textPrimary}>
                                  {risk.condition}
                                </Text>
                                <Badge
                                  colorScheme={
                                    risk.risk === "high" ? "red" : risk.risk === "medium" ? "yellow" : "green"
                                  }
                                  variant="solid"
                                  fontSize="sm"
                                  px={3}
                                  py={1}
                                  borderRadius="full"
                                >
                                  {risk.risk} risk
                                </Badge>
                              </HStack>
                              <Text color={textSecondary} fontSize="sm">
                                {risk.symptoms}
                              </Text>
                              {risk.recommendation && (
                                <Text color="blue.300" fontSize="sm" fontStyle="italic">
                                  {risk.recommendation}
                                </Text>
                              )}
                            </Stack>
                          </CardBody>
                        </Card>
                      ))}
                      <Box p={4} bg="transparent" borderRadius="lg" border="1px dashed" borderColor={borderColor}>
                        <Text fontSize="sm" color={textSecondary} textAlign="center">
                          💡 Screening is informational only. Consult a healthcare professional for medical advice.
                        </Text>
                      </Box>
                    </VStack>
                  </GlassCard>
                </VStack>
              </GridItem>
            </Grid>

            {/* CTA Footer */}
            <GlassCard>
              <VStack spacing={4} textAlign="center" py={6}>
                <Heading size="md" color={textPrimary}>
                  Ready to transform your sleep?
                </Heading>
                <Text color={textSecondary} maxW="2xl">
                  Join thousands who improved sleep quality by an average of 42% using personalized insights and
                  AI-powered coaching.
                </Text>
                <Button as={RouterLink} to="/sleep/coach" colorScheme="purple" size="lg" rightIcon={<FaRobot />}>
                  Start with AI Sleep Coach
                </Button>
              </VStack>
            </GlassCard>
          </>
        )}
      </Container>

      {/* Sticky Back-to-Sleep FAB */}
      <Box position="fixed" right={{ base: 3, md: 6 }} bottom={{ base: 3, md: 6 }} zIndex={20}>
        <Tooltip label="Back to Sleep Dashboard" hasArrow>
          <Button
            as={RouterLink}
            to="/sleep"
            leftIcon={<ChevronLeftIcon />}
            colorScheme="purple"
            size="md"
            borderRadius="full"
            boxShadow="lg"
          >
            Sleep
          </Button>
        </Tooltip>
      </Box>
    </Box>
  );
}
