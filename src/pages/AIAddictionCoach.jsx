// src/pages/AIAddictionCoach.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box, Heading, Text, VStack, HStack, Input, IconButton, Button, Avatar, Badge,
  useColorModeValue, useToast, SimpleGrid, Wrap, WrapItem, Tooltip, Spinner,
  Container, Flex, Card, CardBody, Stack, Icon, Grid, GridItem, Alert, AlertIcon,
  AlertTitle, AlertDescription
} from "@chakra-ui/react";
import { ArrowUpIcon, InfoOutlineIcon, ChevronLeftIcon } from "@chakra-ui/icons";
import { FaRobot, FaMicrophone, FaMicrophoneSlash, FaVolumeUp, FaShieldAlt, FaHandsHelping } from "react-icons/fa";
import { Link as RouterLink } from "react-router-dom";
import { getRecoverySnapshot } from "../services/recoveryStore";

import { API_BASE } from "../lib/apiBase";

const getSpeechRecognition = () => {
  if (typeof window === "undefined") return null;
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  return SR ? new SR() : null;
};
const SR = getSpeechRecognition();
const hasSR = !!SR;

export default function AIAddictionCoach() {
  const toast = useToast();

  // NEW: load snapshot
  const [snapshot, setSnapshot] = useState(null);
  useEffect(() => {
    getRecoverySnapshot().then(setSnapshot).catch(() => setSnapshot(null));
  }, []);

  const [messages, setMessages] = useState(() => {
    const cached = localStorage.getItem("aiaddictioncoach:messages");
    return cached
      ? JSON.parse(cached)
      : [
          {
            role: "assistant",
            content:
              "Hi, I’m your AI Recovery Coach. I can help you build a personalized plan (education only), including SMART goals, trigger management, craving strategies, and a relapse-prevention plan. What would you like to focus on first?",
          },
        ];
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [voiceState, setVoiceState] = useState("idle");
  const [sessionState, setSessionState] = useState("running");
  const abortRef = useRef(null);
  const listRef = useRef(null);

  // theme
  const bg = useColorModeValue("linear-gradient(135deg, #f8fafc 0%, #edf2f7 100%)", "linear-gradient(135deg, #1a202c 0%, #2d3748 100%)");
  const textPrimary = useColorModeValue("gray.800", "white");
  const textSecondary = useColorModeValue("gray.600", "gray.300");
  const cardBg = useColorModeValue("white", "gray.700");
  const panelBg = useColorModeValue("gray.50", "gray.800");
  const bubbleBg = useColorModeValue("white", "gray.600");
  const userBg = useColorModeValue("purple.500", "purple.400");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  useEffect(() => {
    localStorage.setItem("aiaddictioncoach:messages", JSON.stringify(messages));
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => () => {
    if (abortRef.current) abortRef.current.abort();
    if (recording && SR) SR.stop();
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, [recording]);

  const cleanForTTS = (raw = "") =>
    raw.replace(/\*\*|__/g, "").replace(/\*|_/g, "").replace(/`+/g, "")
      .replace(/^#{1,6}\s*/gm, "").replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
      .replace(/^\s*[-•]\s+/gm, "").replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n").trim();

  const speakLastReply = () => {
    const last = [...messages].reverse().find((m) => m.role === "assistant");
    if (!last || !window?.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(cleanForTTS(last.content));
    u.onend = () => setVoiceState("idle");
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
    setVoiceState("speaking");
  };
  const stopSpeak = () => {
    if (!window?.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setVoiceState("idle");
  };

  const toggleRec = () => {
    if (!hasSR) {
      toast({ title: "Voice not supported in this browser.", status: "warning" });
      return;
    }
    if (sessionState !== "running") {
      toast({ title: "Coach is paused/stopped. Start to dictate.", status: "info" });
      return;
    }
    if (!recording) {
      SR.lang = "en-US";
      SR.interimResults = false;
      SR.onresult = (e) => {
        const transcript = Array.from(e.results).map((r) => r[0].transcript).join(" ");
        setInput((p) => (p ? `${p} ${transcript}` : transcript));
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

  const askCoach = async (userText) => {
    if (sessionState !== "running") return "Coach is paused. Tap Start to continue.";
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    try {
      const expanded = `${userText}

Please respond with:
- Descriptive sections and clear bullets/steps.
- A SMART goal, trigger & craving plan (CBT/DBT strategies), optional harm-reduction.
- Optional MAT overview (education only)—encourage talking to a clinician.
- A 7-day starter plan and a relapse-prevention checklist.
- Personalize using the provided snapshot.`;

      const r = await fetch(`${API_BASE}/api/ai/addiction-coach`, {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: expanded, context: snapshot || {} }),
      });
      if (!r.ok) {
        const detail = await r.text().catch(() => "");
        throw new Error(`API ${r.status}: ${detail}`);
      }
      const data = await r.json();
      return data?.reply || "No reply.";
    } catch (err) {
      if (err.name === "AbortError") return "Request canceled.";
      console.error("[AIAddictionCoach] error:", err);
      toast({ title: "Coach request failed", description: "Check /api/ai/addiction-coach & OPENAI_API_KEY", status: "error" });
      return "I ran into an issue generating that. Please try again.";
    } finally {
      setLoading(false);
    }
  };

  const onSend = async () => {
    const text = input.trim();
    if (!text) return;
    setMessages((m) => [...m, { role: "user", content: text }]);
    setInput("");
    const reply = await askCoach(text);
    setMessages((m) => [...m, { role: "assistant", content: reply }]);
  };

  const prompts = useMemo(
    () => [
      "Help me set a SMART goal to reduce or quit",
      "Map my triggers and create a craving plan",
      "Build a 7-day starter plan for early recovery",
      "Create a relapse-prevention checklist",
      "How can I talk to family and get support?",
      "What are harm-reduction strategies I can use now?",
      "What should I ask a clinician about treatment/MAT?",
    ],
    []
  );

  return (
    <Box minH="100vh" bg={bg}>
      <Container maxW="8xl" px={{ base: 4, md: 8 }} py={8}>
        <VStack align="stretch" spacing={6} mb={4}>
          <HStack justify="space-between" flexWrap="wrap" gap={3}>
            <HStack spacing={3}>
              <Button
                as={RouterLink}
                to="/recovery"
                leftIcon={<ChevronLeftIcon />}
                variant="outline"
                borderColor={borderColor}
              >
                Recovery
              </Button>
              <HStack>
                <Icon as={FaRobot} color="purple.500" boxSize={7} />
                <Heading size="lg" color={textPrimary}>AI Recovery Coach</Heading>
              </HStack>
            </HStack>
            <Badge colorScheme={sessionState === "running" ? "green" : "purple"} borderRadius="full" px={3}>
              {sessionState === "running" ? "Live" : "Paused"}
            </Badge>
          </HStack>

          <Alert status="warning" variant="left-accent" borderRadius="md">
            <AlertIcon />
            <Box>
              <AlertTitle>Important Safety Note</AlertTitle>
              <AlertDescription fontSize="sm">
                Educational support only—not medical advice. In an emergency or if you’re considering self-harm, call local emergency services (e.g., 911 in the U.S.). Confidential help: SAMHSA 1-800-662-HELP (U.S.).
              </AlertDescription>
            </Box>
          </Alert>
        </VStack>

        <Card mb={8} bg={cardBg} border="1px" borderColor={borderColor}>
          <CardBody>
            <VStack align="start" spacing={4}>
              <HStack>
                <Icon as={FaHandsHelping} color="purple.500" />
                <Heading size="md" color={textPrimary}>Quick Start Prompts</Heading>
              </HStack>
              <Wrap spacing={3}>
                {prompts.map((p) => (
                  <WrapItem key={p}>
                    <Button size="sm" variant="outline" borderColor={borderColor} onClick={() => setInput(p)}>
                      {p}
                    </Button>
                  </WrapItem>
                ))}
              </Wrap>
            </VStack>
          </CardBody>
        </Card>

        <Grid templateColumns={{ base: "1fr", xl: "2fr 1fr" }} gap={8}>
          <GridItem>
            <Card bg={cardBg} border="1px" borderColor={borderColor}>
              <CardBody>
                <VStack align="stretch" spacing={4}>
                  <HStack justify="space-between">
                    <Heading size="md" color={textPrimary}>Recovery Chat</Heading>
                    <Badge variant="subtle" colorScheme="purple">AI-Powered</Badge>
                  </HStack>

                  <Box
                    ref={listRef}
                    bg={panelBg}
                    border="1px" borderColor={borderColor}
                    borderRadius="xl"
                    h={{ base: "50vh", md: "60vh" }}
                    p={4}
                    overflowY="auto"
                  >
                    <VStack align="stretch" spacing={4}>
                      {messages.map((m, i) => (
                        <HStack key={`${m.role}-${i}`} align="start" spacing={3} justify={m.role === "user" ? "flex-end" : "flex-start"}>
                          {m.role === "assistant" && <Avatar size="sm" bg="purple.500" color="white" icon={<FaRobot />} />}
                          <Box
                            maxW="80%"
                            bg={m.role === "user" ? userBg : bubbleBg}
                            color={m.role === "user" ? "white" : textPrimary}
                            border="1px solid"
                            borderColor={m.role === "user" ? "transparent" : borderColor}
                            px={4}
                            py={3}
                            borderRadius="2xl"
                          >
                            <Text whiteSpace="pre-wrap">{m.content}</Text>
                          </Box>
                          {m.role === "user" && <Avatar size="sm" name="You" />}
                        </HStack>
                      ))}
                      {loading && (
                        <HStack justify="center" py={2}>
                          <Spinner size="sm" />
                          <Text color={textSecondary} fontSize="sm">Thinking…</Text>
                        </HStack>
                      )}
                    </VStack>
                  </Box>

                  <VStack spacing={2} align="stretch">
                    <HStack>
                      <Tooltip label={hasSR ? "Dictate message" : "Voice not supported"}>
                        <IconButton
                          aria-label="Mic"
                          icon={recording ? <FaMicrophoneSlash /> : <FaMicrophone />}
                          onClick={toggleRec}
                          isDisabled={!hasSR || sessionState !== "running"}
                          variant="outline"
                          borderColor={borderColor}
                        />
                      </Tooltip>
                      <Input
                        placeholder="Describe your goal, triggers, past attempts, supports…"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sessionState === "running" && onSend()}
                        bg={bubbleBg}
                        borderColor={borderColor}
                      />
                      <IconButton
                        aria-label="Send"
                        icon={<ArrowUpIcon />}
                        onClick={onSend}
                        isDisabled={sessionState !== "running"}
                        isLoading={loading}
                        colorScheme="purple"
                      />
                      <Tooltip label={voiceState !== "idle" ? "Stop voice" : "Read last reply"}>
                        <IconButton
                          aria-label="Speak"
                          icon={<FaVolumeUp />}
                          onClick={() => (voiceState !== "idle" ? stopSpeak() : speakLastReply())}
                          variant="outline"
                          borderColor={borderColor}
                        />
                      </Tooltip>
                    </HStack>
                    <HStack opacity={0.75} fontSize="xs" color={textSecondary}>
                      <InfoOutlineIcon />
                      <Text>Educational support only. For medical advice or medication, please consult a licensed clinician.</Text>
                    </HStack>
                  </VStack>
                </VStack>
              </CardBody>
            </Card>
          </GridItem>

          <GridItem>
            <VStack spacing={6} align="stretch">
              <Card bg={cardBg} border="1px" borderColor={borderColor}>
                <CardBody>
                  <VStack align="start" spacing={3}>
                    <HStack>
                      <Icon as={FaShieldAlt} color="purple.500" />
                      <Heading size="sm" color={textPrimary}>Relapse-Prevention Corner</Heading>
                    </HStack>
                    <Text fontSize="sm" color={textSecondary}>
                      Urge surfing (10–20 min), 5-minute delay + deep breathing, call a support person, change location, and quick exercise burst.
                    </Text>
                    <Wrap spacing={2}>
                      {["Urge Surfing", "5-Minute Delay", "Call a Peer", "Change Location", "Quick Exercise"].map((t) => (
                        <Badge key={t} variant="subtle" colorScheme="purple">{t}</Badge>
                      ))}
                    </Wrap>
                  </VStack>
                </CardBody>
              </Card>

              {/* Optional: show snapshot summary */}
              {snapshot && (
                <Card bg={cardBg} border="1px" borderColor={borderColor}>
                  <CardBody>
                    <VStack align="start" spacing={2}>
                      <Heading size="sm" color={textPrimary}>Your Snapshot</Heading>
                      <Text fontSize="sm" color={textSecondary}>
                        Substance: <b>{snapshot.substance}</b> • Stage: <b>{snapshot.pattern?.stage}</b> • Days sober: <b>{snapshot.pattern?.daysSober}</b>
                      </Text>
                      <Text fontSize="sm" color={textSecondary}>
                        Top triggers: {snapshot.risks?.topTriggers?.slice(0,3).join(", ")}
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>
              )}
            </VStack>
          </GridItem>
        </Grid>
      </Container>
    </Box>
  );
}
