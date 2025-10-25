// src/pages/AISleepCoach.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Input,
  IconButton,
  Button,
  Avatar,
  Badge,
  useColorModeValue,
  useToast,
  SimpleGrid,
  Wrap,
  WrapItem,
  Tooltip,
  Spinner,
  Divider,
  Container,
  Flex,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Card,
  CardBody,
  Stack,
  Icon,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import { ArrowUpIcon, RepeatIcon, InfoOutlineIcon, ChevronLeftIcon } from "@chakra-ui/icons";
import {
  FaRobot,
  FaMicrophone,
  FaMicrophoneSlash,
  FaVolumeUp,
  FaBed,
  FaHeart,
  FaBrain,
  FaClock,
  FaCrown,
} from "react-icons/fa";
import { GiNightSleep, GiAlarmClock } from "react-icons/gi";
import { Link as RouterLink } from "react-router-dom";

import GlassCard from "../components/GlassCard";
import { getSleepData } from "../services/sleepStore";

// --- API base ---------------------------------------------------------------
const API_BASE = import.meta.env?.VITE_API_BASE || "http://localhost:5164";

// --- Speech Recognition (guarded for browser support) ------------------------
const getSpeechRecognition = () => {
  if (typeof window === "undefined") return null;
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  return SpeechRecognition ? new SpeechRecognition() : null;
};
const SR = getSpeechRecognition();
const hasSpeechRecognition = !!SR;

export default function AISleepCoach() {
  const toast = useToast();

  // data + chat
  const [sleepData, setSleepData] = useState({});
  const [messages, setMessages] = useState(() => {
    const cached = localStorage.getItem("aisleepcoach:messages");
    return cached
      ? JSON.parse(cached)
      : [
          {
            role: "assistant",
            content:
              "Hi! I'm your AI Sleep Coach. I can analyze your recent sleep, spot patterns, and suggest a personalized plan. What would you like help with today?",
          },
        ];
  });
  const [input, setInput] = useState("");

  // ui state
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);

  // voice state (TTS)
  const [voiceState, setVoiceState] = useState("idle"); // 'idle' | 'speaking'

  // coach controls
  const [sessionState, setSessionState] = useState("running"); // start enabled
  const abortRef = useRef(null); // AbortController for in-flight requests

  // --- Theme tokens (rich/lux look) ------------------------------------------
  const bgGradient = useColorModeValue(
    "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
    "linear-gradient(135deg, #1a202c 0%, #2d3748 100%)"
  );
  const primaryColor = useColorModeValue("purple.600", "purple.300");
  const secondaryColor = useColorModeValue("blue.600", "blue.300");
  const accentColor = useColorModeValue("teal.500", "teal.300");

  const textPrimary = useColorModeValue("gray.800", "white");
  const textSecondary = useColorModeValue("gray.600", "gray.300");
  const textMuted = useColorModeValue("gray.500", "gray.400");

  const cardBg = useColorModeValue("white", "gray.700");
  const panelBg = useColorModeValue("gray.50", "gray.800");
  const bubbleBg = useColorModeValue("white", "gray.600");
  const userBubbleBg = useColorModeValue("purple.500", "purple.400");
  const assistantBubbleBg = useColorModeValue("gray.100", "gray.600");

  const borderColor = useColorModeValue("gray.200", "gray.600");

  const buttonBg = useColorModeValue("purple.500", "purple.400");
  const buttonHover = useColorModeValue("purple.600", "purple.300");

  const listRef = useRef(null);

  // load snapshot
  useEffect(() => {
    getSleepData().then((d) => setSleepData(d || {})).catch(() => {});
  }, []);

  // autoscroll + cache messages
  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
    localStorage.setItem("aisleepcoach:messages", JSON.stringify(messages));
  }, [messages]);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
      if (recording && SR) SR.stop();
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [recording]);

  // ---- TTS helpers ----------------------------------------------------------
  const cleanForTTS = (raw = "") =>
    raw
      .replace(/\*\*|__/g, "")
      .replace(/\*|_/g, "")
      .replace(/`+/g, "")
      .replace(/^#{1,6}\s*/gm, "")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
      .replace(/^\s*[-•]\s+/gm, "")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

  const voiceStartLastReply = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const last = [...messages].reverse().find((m) => m.role === "assistant");
    if (!last) return;
    const u = new SpeechSynthesisUtterance(cleanForTTS(last.content));
    u.onend = () => setVoiceState("idle");
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
    setVoiceState("speaking");
  };

  const voiceStop = () => {
    if (!window?.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setVoiceState("idle");
  };

  // ---- Voice: STT -----------------------------------------------------------
  const toggleRecording = () => {
    if (!SR) {
      toast({ title: "Voice not supported in this browser.", status: "warning" });
      return;
    }
    if (sessionState === "paused") {
      toast({ title: "Coach is paused. Start to dictate.", status: "info" });
      return;
    }
    if (!recording) {
      SR.lang = "en-US";
      SR.interimResults = false;
      SR.onresult = (e) => {
        const transcript = Array.from(e.results).map((r) => r[0].transcript).join(" ");
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };
      SR.onerror = () => setRecording(false);
      SR.onend = () => setRecording(false);
      SR.start();
      setRecording(true);
    } else {
      SR.stop();
      setRecording(false);
    }
  };

  // ---- Server call (now rich + descriptive) ---------------------------------
  const askCoach = async (userText) => {
    if (sessionState === "paused") return "Coach is paused. Tap Start to continue.";
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    try {
      const expandedPrompt =
        `${userText}\n\n` +
        `Please answer comprehensively with:\n` +
        `- 6–10 concise bullets or numbered steps.\n` +
        `- Specific timing windows, light/noise/temperature guidance, and evening routine tweaks.\n` +
        `- Where useful, a simple 7-day plan and a short “why this works” rationale for each major step.\n` +
        `- Include habit stacking and implementation intentions (e.g., “If it’s 9:30pm, then I will…”).\n` +
        `- Keep it practical and personalized using the provided sleep snapshot.`;

      const reply = await fetch(`${API_BASE}/api/ai/sleep-coach`, {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: expandedPrompt,
          context: sleepData || {},
        }),
      });

      if (!reply.ok) {
        const detail = await reply.text().catch(() => "");
        throw new Error(`API error ${reply.status}: ${detail}`);
      }

      const data = await reply.json();
      return data?.reply || "No reply.";
    } catch (err) {
      if (err.name === "AbortError") return "Request canceled.";
      console.error("[AISleepCoach] askCoach error:", err);
      toast({
        title: "Sleep coach request failed",
        description: "Check the server (5164) and your API key in .env",
        status: "error",
      });
      return "I hit a snag analyzing that. Try again?";
    } finally {
      setLoading(false);
    }
  };

  // ---- Send message ---------------------------------------------------------
  const onSend = async () => {
    const text = input.trim();
    if (!text) return;
    const next = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    const reply = await askCoach(text);
    setMessages((m) => [...m, { role: "assistant", content: reply }]);
  };

  // ---- Coach Controls -------------------------------------------------------
  const onStart = () => {
    setSessionState("running");
    toast({ title: "Coach started", status: "success", duration: 1200 });
  };
  const onPause = () => {
    setSessionState("paused");
    if (abortRef.current) abortRef.current.abort();
    if (recording && SR) SR.stop();
    voiceStop();
    setLoading(false);
    toast({ title: "Coach paused", status: "info", duration: 1200 });
  };
  const onStop = () => {
    setSessionState("idle");
    if (abortRef.current) abortRef.current.abort();
    if (recording && SR) SR.stop();
    voiceStop();
    setLoading(false);
    toast({ title: "Coach stopped", status: "warning", duration: 1200 });
  };
  const onReset = () => {
    onStop();
    const seed = [
      {
        role: "assistant",
        content:
          "Reset complete. How can I help with sleep today? You can start by asking for a quick review of the last 7 nights.",
      },
    ];
    setMessages(seed);
    localStorage.setItem("aisleepcoach:messages", JSON.stringify(seed));
    setInput("");
    setSessionState("running");
    toast({ title: "Session reset", status: "success", duration: 1200 });
  };

  // ---- Quick prompts --------------------------------------------------------
  const quickPrompts = useMemo(
    () => [
      "Analyze my sleep patterns and suggest improvements",
      "Create a personalized bedtime routine",
      "Why do I wake up tired and how to fix it?",
      "Optimize my sleep environment",
      "Help me with a jet lag recovery plan",
      "Analyze my deep vs REM sleep balance",
    ],
    []
  );

  // Enhanced metrics (fallbacks if store empty)
  const sleepMetrics = {
    score: sleepData?.sleepScore || 76,
    duration: sleepData?.averageDuration || "7h 30m",
    efficiency: sleepData?.efficiency ?? 94,
    consistency: sleepData?.consistency ?? 86,
    deepSleep: sleepData?.lastNight?.deepSleep || "1.8h",
    remSleep: sleepData?.lastNight?.remSleep || "1.5h",
    restingHR: sleepData?.lastNight?.restingHR || 58,
    noiseLevel: sleepData?.environment?.noise ?? 42,
  };

  const MetricCard = ({ icon, label, value, change, color = "purple" }) => (
    <Card
      bg={cardBg}
      border="1px"
      borderColor={borderColor}
      shadow="md"
      height="100%"
      _hover={{ shadow: "lg", transform: "translateY(-2px)" }}
      transition="all 0.2s"
    >
      <CardBody>
        <Stack spacing={3}>
          <HStack justify="space-between">
            <Icon as={icon} color={`${color}.500`} boxSize={5} />
            <Badge colorScheme={color} variant="subtle" borderRadius="full" px={2} fontSize="2xs">
              Live
            </Badge>
          </HStack>
          <Stat>
            <StatLabel color={textSecondary} fontSize="sm" fontWeight="medium">
              {label}
            </StatLabel>
            <StatNumber color={textPrimary} fontSize="xl" fontWeight="bold">
              {value}
            </StatNumber>
            {typeof change === "number" && (
              <StatHelpText color={textMuted} fontSize="xs">
                <StatArrow type={change >= 0 ? "increase" : "decrease"} />
                {Math.abs(change)}% from last week
              </StatHelpText>
            )}
          </Stat>
        </Stack>
      </CardBody>
    </Card>
  );

  return (
    <Box minH="100vh" bg={bgGradient}>
      <Container maxW="8xl" px={{ base: 4, md: 8 }} py={8}>
        {/* Header */}
        <Flex justify="space-between" align="center" mb={8} flexWrap="wrap" gap={4}>
          <VStack align="start" spacing={3}>
            <HStack spacing={4} flexWrap="wrap">
              {/* Back to Sleep Dashboard button */}
              <Button
                as={RouterLink}
                to="/sleep"
                leftIcon={<ChevronLeftIcon />}
                variant="outline"
                color={primaryColor}
                borderColor={borderColor}
                _hover={{ bg: panelBg }}
                size="lg"
              >
                Sleep Dashboard
              </Button>

              <HStack spacing={3}>
                <Icon as={FaRobot} boxSize={8} color={primaryColor} />
                <VStack align="start" spacing={1}>
                  <Heading size="xl" color={textPrimary} fontWeight="bold">
                    AI Sleep Coach
                  </Heading>
                  <Text color={textSecondary} fontSize="lg">
                    Premium personalized sleep guidance
                  </Text>
                </VStack>
              </HStack>
            </HStack>
          </VStack>

          <VStack spacing={3} align="end">
            <Badge colorScheme="purple" variant="solid" borderRadius="full" px={4} py={1}>
              <HStack spacing={2}>
                <Box w={2} h={2} bg="green.400" borderRadius="full" />
                <Text textTransform="capitalize" fontSize="sm" color="white">
                  {sessionState === "idle" ? "Ready" : sessionState}
                </Text>
              </HStack>
            </Badge>

            <Wrap spacing={2} justify="flex-end">
              <Tooltip label="Start Session">
                <Button size="sm" onClick={onStart} isDisabled={sessionState === "running"} colorScheme="green">
                  Start
                </Button>
              </Tooltip>
              <Tooltip label="Pause Coach">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onPause}
                  isDisabled={sessionState !== "running"}
                  color={textPrimary}
                  borderColor={borderColor}
                >
                  Pause
                </Button>
              </Tooltip>
              <Tooltip label="Stop Session">
                <Button size="sm" variant="outline" onClick={onStop} color={textPrimary} borderColor={borderColor}>
                  Stop
                </Button>
              </Tooltip>
              <Tooltip label="Reset Conversation">
                <Button size="sm" colorScheme="gray" onClick={onReset} variant="outline">
                  Reset
                </Button>
              </Tooltip>
            </Wrap>
          </VStack>
        </Flex>

        {/* Quick Prompts */}
        <Card mb={8} bg={cardBg} border="1px" borderColor={borderColor} shadow="md">
          <CardBody>
            <VStack spacing={4} align="start">
              <HStack>
                <Icon as={FaCrown} color={accentColor} />
                <Heading size="md" color={textPrimary}>
                  Quick Start Prompts
                </Heading>
              </HStack>
              <Wrap spacing={3}>
                {quickPrompts.map((q) => (
                  <WrapItem key={q}>
                    <Button
                      size="sm"
                      variant="outline"
                      borderColor={borderColor}
                      color={textPrimary}
                      _hover={{ bg: panelBg }}
                      onClick={() => setInput(q)}
                      maxW="300px"
                      textAlign="left"
                      whiteSpace="normal"
                      height="auto"
                      py={2}
                    >
                      {q}
                    </Button>
                  </WrapItem>
                ))}
              </Wrap>
            </VStack>
          </CardBody>
        </Card>

        {/* Main Content */}
        <Grid templateColumns={{ base: "1fr", xl: "2fr 1fr" }} gap={8} mb={8}>
          {/* Chat */}
          <GridItem>
            <Card bg={cardBg} border="1px" borderColor={borderColor} shadow="md">
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <HStack justify="space-between">
                    <HStack>
                      <Icon as={GiNightSleep} color={primaryColor} />
                      <Heading size="md" color={textPrimary}>
                        Sleep Coach Chat
                      </Heading>
                    </HStack>
                    <Badge colorScheme="purple" variant="subtle">
                      AI-Powered
                    </Badge>
                  </HStack>

                  <Box
                    ref={listRef}
                    bg={panelBg}
                    borderRadius="xl"
                    p={4}
                    h={{ base: "50vh", md: "60vh" }}
                    overflowY="auto"
                    border="1px"
                    borderColor={borderColor}
                  >
                    <VStack align="stretch" spacing={4}>
                      {messages.map((m, i) => (
                        <HStack
                          key={`${m.role}-${i}`}
                          align="start"
                          spacing={3}
                          justify={m.role === "user" ? "flex-end" : "flex-start"}
                        >
                          {m.role === "assistant" && (
                            <Avatar size="sm" name="Coach" icon={<FaRobot />} bg={primaryColor} color="white" />
                          )}
                          <Box
                            maxW="80%"
                            bg={m.role === "user" ? userBubbleBg : assistantBubbleBg}
                            color={m.role === "user" ? "white" : textPrimary}
                            border="1px solid"
                            borderColor={m.role === "user" ? primaryColor : borderColor}
                            px={4}
                            py={3}
                            borderRadius="2xl"
                            shadow="sm"
                          >
                            <Text fontSize="md" whiteSpace="pre-wrap" lineHeight="tall">
                              {m.content}
                            </Text>
                          </Box>
                          {m.role === "user" && <Avatar size="sm" name="You" bg={secondaryColor} color="white" />}
                        </HStack>
                      ))}
                      {loading && (
                        <HStack spacing={3} justify="center" py={4}>
                          <Spinner size="sm" color={primaryColor} />
                          <Text color={textSecondary} fontSize="sm">
                            Analyzing your sleep patterns...
                          </Text>
                        </HStack>
                      )}
                    </VStack>
                  </Box>

                  {/* Input Area */}
                  <VStack spacing={3}>
                    <HStack spacing={2} width="100%">
                      <Tooltip label={hasSpeechRecognition ? "Hold to dictate" : "Voice not supported"}>
                        <IconButton
                          aria-label="Mic"
                          icon={recording ? <FaMicrophoneSlash /> : <FaMicrophone />}
                          onClick={toggleRecording}
                          isDisabled={!hasSpeechRecognition || sessionState === "paused"}
                          colorScheme={recording ? "red" : "gray"}
                          variant="outline"
                          borderColor={borderColor}
                        />
                      </Tooltip>
                      <Input
                        placeholder="Ask anything about your sleep patterns, routines, or improvements..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sessionState !== "paused" && onSend()}
                        isDisabled={sessionState === "paused"}
                        bg={bubbleBg}
                        borderColor={borderColor}
                        color={textPrimary}
                        _placeholder={{ color: textMuted }}
                        size="lg"
                      />
                      <IconButton
                        aria-label="Send"
                        icon={<ArrowUpIcon />}
                        onClick={onSend}
                        isLoading={loading}
                        isDisabled={sessionState === "paused"}
                        bg={buttonBg}
                        color="white"
                        _hover={{ bg: buttonHover }}
                        size="lg"
                      />
                      <Tooltip label={voiceState !== "idle" ? "Stop voice" : "Read last reply"}>
                        <IconButton
                          aria-label="Speak"
                          icon={<FaVolumeUp />}
                          onClick={() => {
                            if (voiceState !== "idle") voiceStop();
                            else voiceStartLastReply();
                          }}
                          colorScheme={voiceState !== "idle" ? "blue" : "gray"}
                          variant="outline"
                          borderColor={borderColor}
                        />
                      </Tooltip>
                    </HStack>
                    <HStack opacity={0.7} fontSize="xs" color={textMuted}>
                      <InfoOutlineIcon />
                      <Text>Voice features use browser Speech APIs. No audio leaves your device.</Text>
                    </HStack>
                  </VStack>
                </VStack>
              </CardBody>
            </Card>
          </GridItem>

          {/* Data Sidebar */}
          <GridItem>
            <VStack spacing={6} align="stretch">
              {/* Sleep Score */}
              <Card bg={cardBg} border="1px" borderColor={borderColor} shadow="md">
                <CardBody>
                  <VStack spacing={4} align="center">
                    <HStack justify="space-between" width="100%">
                      <Heading size="md" color={textPrimary}>
                        Sleep Quality
                      </Heading>
                      <Badge colorScheme="purple" variant="solid">
                        {sleepMetrics.score}/100
                      </Badge>
                    </HStack>
                    <Box position="relative" w={32} h={32}>
                      <Progress
                        value={sleepMetrics.score}
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
                          {sleepMetrics.score}
                        </Text>
                        <Text fontSize="sm" opacity={0.8} color={textSecondary}>
                          Score
                        </Text>
                      </Box>
                    </Box>
                    <Text fontSize="sm" color={textSecondary} textAlign="center">
                      {sleepMetrics.score >= 80
                        ? "Excellent sleep quality"
                        : sleepMetrics.score >= 60
                        ? "Good, with room for improvement"
                        : "Needs attention"}
                    </Text>
                  </VStack>
                </CardBody>
              </Card>

              {/* Live Metrics */}
              <SimpleGrid columns={2} spacing={4}>
                <MetricCard icon={FaClock} label="Duration" value={sleepMetrics.duration} change={12} color="blue" />
                <MetricCard
                  icon={FaBed}
                  label="Efficiency"
                  value={`${sleepMetrics.efficiency}%`}
                  change={8}
                  color="green"
                />
                <MetricCard
                  icon={GiAlarmClock}
                  label="Consistency"
                  value={`${sleepMetrics.consistency}%`}
                  change={15}
                  color="orange"
                />
                <MetricCard
                  icon={FaHeart}
                  label="Heart Rate"
                  value={`${sleepMetrics.restingHR} bpm`}
                  change={-5}
                  color="red"
                />
              </SimpleGrid>

              {/* Stages */}
              <Card bg={cardBg} border="1px" borderColor={borderColor} shadow="md">
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <HStack>
                      <Icon as={FaBrain} color={primaryColor} />
                      <Heading size="md" color={textPrimary}>
                        Sleep Stages
                      </Heading>
                    </HStack>
                    <VStack spacing={3} align="stretch">
                      <HStack justify="space-between">
                        <Text color={textSecondary}>Deep Sleep</Text>
                        <Badge colorScheme="blue">{sleepMetrics.deepSleep}</Badge>
                      </HStack>
                      <HStack justify="space-between">
                        <Text color={textSecondary}>REM Sleep</Text>
                        <Badge colorScheme="purple">{sleepMetrics.remSleep}</Badge>
                      </HStack>
                      <Progress value={65} colorScheme="blue" size="sm" borderRadius="full" bg={panelBg} />
                      <Text fontSize="xs" color={textMuted} textAlign="center">
                        Optimal stage balance: 65%
                      </Text>
                    </VStack>
                  </VStack>
                </CardBody>
              </Card>

              <Button
                leftIcon={<RepeatIcon />}
                variant="outline"
                color={textPrimary}
                borderColor={borderColor}
                _hover={{ bg: panelBg }}
                onClick={() => getSleepData().then(setSleepData)}
              >
                Refresh Sleep Data
              </Button>
            </VStack>
          </GridItem>
        </Grid>

        {/* Premium Footer */}
        <Card bg={cardBg} border="1px" borderColor={borderColor} shadow="md">
          <CardBody>
            <VStack spacing={4} textAlign="center" py={6}>
              <Icon as={FaCrown} boxSize={8} color="yellow.500" />
              <Heading size="md" color={textPrimary}>
                Premium AI Sleep Coaching
              </Heading>
              <Text color={textSecondary} maxW="2xl">
                Get personalized sleep optimization strategies, real-time pattern analysis, and expert guidance powered
                by modern sleep science and machine learning.
              </Text>
              <Wrap spacing={4} justify="center">
                <Badge colorScheme="purple" variant="subtle">
                  24/7 Availability
                </Badge>
                <Badge colorScheme="green" variant="subtle">
                  Medical-grade Analysis
                </Badge>
                <Badge colorScheme="blue" variant="subtle">
                  Personalized Plans
                </Badge>
              </Wrap>
            </VStack>
          </CardBody>
        </Card>
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
