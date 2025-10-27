// src/pages/AIHabitsCoach.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box, Heading, Text, VStack, HStack, Input, IconButton, Button, Avatar, Badge,
  useColorModeValue, useToast, SimpleGrid, Wrap, WrapItem, Tooltip, Spinner,
  Container, Flex, Stat, StatLabel, StatNumber, StatHelpText, StatArrow,
  Card, CardBody, Stack, Icon, Grid, GridItem,
} from "@chakra-ui/react";
import { ArrowUpIcon, RepeatIcon, InfoOutlineIcon, ChevronLeftIcon } from "@chakra-ui/icons";
import { FaRobot, FaMicrophone, FaMicrophoneSlash, FaVolumeUp, FaDumbbell, FaHeart, FaFire } from "react-icons/fa";
import { Link as RouterLink } from "react-router-dom";
import { getUserHabits, generateHabitInsights } from "../services/dataStore";

import { API_BASE } from "../lib/apiBase";

// Safe SpeechRecognition getter
const getSpeechRecognition = () => {
  if (typeof window === "undefined") return null;
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  return SR ? new SR() : null;
};
const SR = getSpeechRecognition();
const hasSpeechRecognition = !!SR;

export default function AIHabitsCoach() {
  const toast = useToast();

  // snapshot + insights
  const [habits, setHabits] = useState([]);
  const [insights, setInsights] = useState({});

  // chat
  const [messages, setMessages] = useState(() => {
    const cached = localStorage.getItem("aihabitscoach:messages");
    return cached
      ? JSON.parse(cached)
      : [
          {
            role: "assistant",
            content:
              "Hi! I’m your AI Habits Coach. I can help you build routines, keep streaks, and troubleshoot motivation. What would you like to work on today?",
          },
        ];
  });
  const [input, setInput] = useState("");

  // ui
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [voiceState, setVoiceState] = useState("idle"); // 'idle' | 'speaking'
  const [sessionState, setSessionState] = useState("running");
  const abortRef = useRef(null);
  const listRef = useRef(null);

  // theming
  const bgGradient = useColorModeValue(
    "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
    "linear-gradient(135deg, #1a202c 0%, #2d3748 100%)"
  );
  const primary = useColorModeValue("purple.600", "purple.300");
  const accent = useColorModeValue("teal.500", "teal.300");
  const textPrimary = useColorModeValue("gray.800", "white");
  const textSecondary = useColorModeValue("gray.600", "gray.300");
  const textMuted = useColorModeValue("gray.500", "gray.400");
  const cardBg = useColorModeValue("white", "gray.700");
  const panelBg = useColorModeValue("gray.50", "gray.800");
  const bubbleBg = useColorModeValue("white", "gray.600");
  const userBubbleBg = useColorModeValue("purple.500", "purple.400");
  const assistantBubbleBg = useColorModeValue("gray.100", "gray.600");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  // load user context
  useEffect(() => {
    (async () => {
      try {
        const [h, i] = await Promise.all([getUserHabits(), generateHabitInsights()]);
        setHabits(h || []);
        setInsights(i || {});
      } catch {
        /* no-op */
      }
    })();
  }, []);

  // autoscroll + cache
  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
    localStorage.setItem("aihabitscoach:messages", JSON.stringify(messages));
  }, [messages]);

  // cleanup
  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
      if (recording && SR) SR.stop();
      if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, [recording]);

  // TTS helpers
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
    if (!window?.speechSynthesis) return;
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

  // STT
  const toggleRecording = () => {
    if (!SR) {
      toast({ title: "Voice not supported in this browser.", status: "warning" });
      return;
    }
    if (sessionState === "paused") {
      toast({ title: "Coach is paused. Tap Start to dictate.", status: "info" });
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

  // API
  const askCoach = async (userText) => {
    if (sessionState === "paused") return "Coach is paused. Tap Start to continue.";
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);

    // Minimal context for personalization
    const snapshot = {
      habits: (habits || []).map((h) => ({
        id: h.id,
        name: h.name,
        category: h.category,
        streak: h.streak,
        goal: h.goal,
        unit: h.unit,
      })),
      insights: {
        forecast: insights?.forecast,
        correlations: insights?.correlations,
        predictiveSchedule: insights?.predictiveSchedule?.slice?.(0, 5) || [],
      },
    };

    try {
      const res = await fetch(`${API_BASE}/api/ai/habits-coach`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({ message: userText, context: snapshot }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.detail || "API error");
      }
      const data = await res.json();
      return data?.reply || "Sorry, I couldn’t generate guidance right now.";
    } catch (err) {
      if (err.name === "AbortError") return "Request canceled.";
      console.error(err);
      toast({ title: "Something went wrong contacting the coach.", status: "error" });
      return "I hit a snag analyzing that. Try again?";
    } finally {
      setLoading(false);
    }
  };

  // send flow
  const onSend = async () => {
    const text = input.trim();
    if (!text) return;
    setMessages((m) => [...m, { role: "user", content: text }]);
    setInput("");
    const reply = await askCoach(text);
    setMessages((m) => [...m, { role: "assistant", content: reply }]);
  };

  // controls
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
    const seed = [{ role: "assistant", content: "Reset complete. What habit should we focus on now?" }];
    setMessages(seed);
    localStorage.setItem("aihabitscoach:messages", JSON.stringify(seed));
    setInput("");
    setSessionState("running");
    toast({ title: "Session reset", status: "success", duration: 1200 });
  };

  const quickPrompts = useMemo(
    () => [
      "Design a morning routine to improve focus.",
      "Help me build a 21-day gym habit.",
      "I keep breaking my evening reading streak—troubleshoot?",
      "Create a weekly plan for meditation and journaling.",
      "Suggest cues and rewards for my hydration habit.",
    ],
    []
  );

  // small metric strip (mocked from insights)
  const metrics = {
    successProb: insights?.forecast?.successProbability || 0,
    bestTime: insights?.predictiveSchedule?.[0]?.time || "—",
    topSynergy: insights?.correlations?.[0]?.relationship || "—",
  };

  const MetricCard = ({ icon, label, value }) => (
    <Card bg={cardBg} border="1px" borderColor={borderColor} shadow="md" height="100%">
      <CardBody>
        <Stack spacing={3}>
          <HStack justify="space-between">
            <Icon as={icon} color={`${"purple"}.500`} boxSize={5} />
            <Badge colorScheme="purple" variant="subtle" borderRadius="full" px={2} fontSize="2xs">
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
            <HStack spacing={4}>
              <Button
                as={RouterLink}
                to="/habits"
                leftIcon={<ChevronLeftIcon />}
                variant="outline"
                color={primary}
                borderColor={borderColor}
                _hover={{ bg: panelBg }}
                size="lg"
              >
                Habit Dashboard
              </Button>
              <HStack spacing={3}>
                <Icon as={FaRobot} boxSize={8} color={primary} />
                <VStack align="start" spacing={1}>
                  <Heading size="xl" color={textPrimary} fontWeight="bold">
                    AI Habits Coach
                  </Heading>
                  <Text color={textSecondary} fontSize="lg">
                    Build consistent routines with evidence-based guidance
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
            <Wrap spacing={2}>
              <Tooltip label="Start">
                <Button size="sm" onClick={onStart} isDisabled={sessionState === "running"} colorScheme="green">
                  Start
                </Button>
              </Tooltip>
              <Tooltip label="Pause">
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
              <Tooltip label="Stop">
                <Button size="sm" variant="outline" onClick={onStop} color={textPrimary} borderColor={borderColor}>
                  Stop
                </Button>
              </Tooltip>
              <Tooltip label="Reset">
                <Button size="sm" colorScheme="gray" onClick={onReset} variant="outline">
                  Reset
                </Button>
              </Tooltip>
            </Wrap>
          </VStack>
        </Flex>

        {/* Quick prompts */}
        <Card mb={8} bg={cardBg} border="1px" borderColor={borderColor} shadow="md">
          <CardBody>
            <VStack spacing={4} align="start">
              <HStack>
                <Icon as={FaFire} color={accent} />
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

        {/* Main */}
        <Grid templateColumns={{ base: "1fr", xl: "2fr 1fr" }} gap={8} mb={8}>
          {/* Chat */}
          <GridItem>
            <Card bg={cardBg} border="1px" borderColor={borderColor} shadow="md">
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <HStack justify="space-between">
                    <HStack>
                      <Icon as={FaDumbbell} color={primary} />
                      <Heading size="md" color={textPrimary}>
                        Coach Chat
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
                            <Avatar size="sm" name="Coach" icon={<FaRobot />} bg={primary} />
                          )}
                          <Box
                            maxW="80%"
                            bg={m.role === "user" ? userBubbleBg : assistantBubbleBg}
                            color={m.role === "user" ? "white" : textPrimary}
                            border="1px solid"
                            borderColor={m.role === "user" ? primary : borderColor}
                            px={4}
                            py={3}
                            borderRadius="2xl"
                            shadow="sm"
                          >
                            <Text fontSize="md" whiteSpace="pre-wrap" lineHeight="tall">
                              {m.content}
                            </Text>
                          </Box>
                          {m.role === "user" && <Avatar size="sm" name="You" bg="blue.500" />}
                        </HStack>
                      ))}
                      {loading && (
                        <HStack spacing={3} justify="center" py={4}>
                          <Spinner size="sm" color={primary} />
                          <Text color={textSecondary} fontSize="sm">
                            Reviewing your habits…
                          </Text>
                        </HStack>
                      )}
                    </VStack>
                  </Box>

                  {/* Input */}
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
                        placeholder="Ask about routines, streaks, motivation, or weekly plans…"
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
                        bg="purple.500"
                        color="white"
                        _hover={{ bg: "purple.600" }}
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
                      <Text>
                        Calls <code>{API_BASE || ""}/api/ai/habits-coach</code> with your habits snapshot.
                      </Text>
                    </HStack>
                  </VStack>
                </VStack>
              </CardBody>
            </Card>
          </GridItem>

          {/* Metrics */}
          <GridItem>
            <VStack spacing={6} align="stretch">
              <Card bg={cardBg} border="1px" borderColor={borderColor} shadow="md">
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <HStack justify="space-between">
                      <Heading size="md" color={textPrimary}>
                        Coaching Snapshot
                      </Heading>
                      <Badge colorScheme="purple" variant="solid" borderRadius="full">
                        Live
                      </Badge>
                    </HStack>
                    <SimpleGrid columns={2} spacing={4}>
                      <MetricCard icon={FaHeart} label="Success Probability" value={`${metrics.successProb}%`} />
                      <MetricCard icon={FaFire} label="Best Time Today" value={metrics.bestTime} />
                    </SimpleGrid>
                    <Button
                      leftIcon={<RepeatIcon />}
                      variant="outline"
                      color={textPrimary}
                      borderColor={borderColor}
                      _hover={{ bg: panelBg }}
                      onClick={async () => {
                        try {
                          const [h, i] = await Promise.all([getUserHabits(), generateHabitInsights()]);
                          setHabits(h || []);
                          setInsights(i || {});
                        } catch {}
                      }}
                    >
                      Refresh from Store
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </GridItem>
        </Grid>
      </Container>
    </Box>
  );
}
