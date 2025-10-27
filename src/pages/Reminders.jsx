// src/pages/Reminders.jsx
import React, { useMemo, useState, useEffect } from "react";
import {
  Box, Heading, Text, VStack, HStack, Button, Badge, useToast,
  Card, CardBody, IconButton, Select, Input, Switch, FormControl,
  FormLabel, SimpleGrid, useColorModeValue, Stack, Wrap, WrapItem
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon, EditIcon, CheckIcon } from "@chakra-ui/icons";
import { useSearchParams, Link as RouterLink } from "react-router-dom";
import {
  listReminders, upsertReminder, deleteReminder,
  REMINDER_TYPES, RECURRENCES
} from "../services/reminderStore";

export default function Reminders() {
  const toast = useToast();
  const [reminders, setReminders] = useState([]); // always an array
  const [editing, setEditing] = useState(null);
  const [params] = useSearchParams();

  const sub = useColorModeValue("gray.600", "gray.400");
  const cardBg = useColorModeValue("white", "gray.700");
  const border = useColorModeValue("gray.200", "gray.600");

  useEffect(() => {
    (async () => {
      const result = await listReminders().catch(() => []);
      setReminders(Array.isArray(result) ? result : []);
    })();
  }, []);

  // Prefill from deep-link: /reminders?type=habit&title=Morning%20Meditation
  useEffect(() => {
    const type = params.get("type");
    const title = params.get("title");
    if (type || title) {
      setEditing((e) => ({
        id: e?.id,
        type: type || "habit",
        title: title || "",
        message: "",
        time: "09:00",
        recurrence: "daily",
        startDate: new Date().toISOString().slice(0, 10),
        enabled: true,
      }));
    }
  }, [params]);

  const reload = async () => {
    const result = await listReminders().catch(() => []);
    setReminders(Array.isArray(result) ? result : []);
  };

  const onSave = async () => {
    if (!editing?.title) {
      toast({ title: "Please add a title", status: "warning" });
      return;
    }
    await upsertReminder(editing);
    await reload();
    setEditing(null);
    toast({ title: "Reminder saved", status: "success" });
  };

  return (
    <Box maxW="7xl" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 6, md: 10 }}>
      {/* Header */}
      <Stack
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        align={{ base: "flex-start", md: "center" }}
        mb={6}
        gap={3}
        spacing={3}
      >
        <Heading size="lg">Configure Reminders</Heading>

        {/* Actions wrap nicely on mobile */}
        <Wrap spacing={2}>
          <WrapItem>
            <Button as={RouterLink} to="/habits" variant="outline" size="sm" w={{ base: "full", sm: "auto" }}>
              Back to Habits
            </Button>
          </WrapItem>
          <WrapItem>
            <Button as={RouterLink} to="/sleep" variant="outline" size="sm" w={{ base: "full", sm: "auto" }}>
              Sleep
            </Button>
          </WrapItem>
          <WrapItem>
            <Button as={RouterLink} to="/wealth" variant="outline" size="sm" w={{ base: "full", sm: "auto" }}>
              Finance
            </Button>
          </WrapItem>
          <WrapItem>
            <Button as={RouterLink} to="/recovery" variant="outline" size="sm" w={{ base: "full", sm: "auto" }}>
              Recovery
            </Button>
          </WrapItem>
        </Wrap>
      </Stack>

      {/* Main grid adapts to mobile */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 4, md: 6 }}>
        {/* List */}
        <Card bg={cardBg} border="1px" borderColor={border}>
          <CardBody>
            <Stack
              direction={{ base: "column", sm: "row" }}
              justify="space-between"
              align={{ base: "flex-start", sm: "center" }}
              mb={3}
              spacing={3}
            >
              <Heading size="sm">My Reminders</Heading>
              <Button
                size="sm"
                leftIcon={<AddIcon />}
                w={{ base: "full", sm: "auto" }}
                onClick={() =>
                  setEditing({
                    type: "habit",
                    title: "",
                    message: "",
                    time: "09:00",
                    recurrence: "daily",
                    startDate: new Date().toISOString().slice(0, 10),
                    enabled: true,
                  })
                }
              >
                New
              </Button>
            </Stack>

            <VStack align="stretch" spacing={{ base: 2, md: 3 }}>
              {(Array.isArray(reminders) ? reminders : []).length === 0 && (
                <Text fontSize="sm" color={sub}>
                  No reminders yet. Create your first one.
                </Text>
              )}

              {(Array.isArray(reminders) ? reminders : []).map((r) => (
                <Stack
                  key={r.id}
                  direction={{ base: "column", md: "row" }}
                  p={3}
                  border="1px"
                  borderColor={border}
                  borderRadius="md"
                  justify="space-between"
                  spacing={{ base: 2, md: 3 }}
                >
                  <VStack align="start" spacing={0}>
                    <HStack flexWrap="wrap" rowGap={1}>
                      <Badge>
                        {(REMINDER_TYPES.find((t) => t.value === r.type)?.label) || r.type}
                      </Badge>
                      <Text fontWeight="600">{r.title}</Text>
                    </HStack>
                    <Text fontSize="sm" color={sub}>
                      {r.recurrence?.toUpperCase?.() || "ONCE"} • {r.time}{" "}
                      {r.recurrence === "once" ? `• ${r.startDate}` : ""}
                    </Text>
                    {r.message && (
                      <Text fontSize="xs" color={sub} noOfLines={{ base: 3, md: 1 }}>
                        {r.message}
                      </Text>
                    )}
                  </VStack>

                  <HStack justify={{ base: "flex-start", md: "flex-end" }}>
                    <Badge colorScheme={r.enabled ? "green" : "gray"}>
                      {r.enabled ? "Enabled" : "Disabled"}
                    </Badge>
                    <IconButton
                      aria-label="Edit"
                      icon={<EditIcon />}
                      size="sm"
                      onClick={() => setEditing(r)}
                    />
                    <IconButton
                      aria-label="Delete"
                      icon={<DeleteIcon />}
                      size="sm"
                      colorScheme="red"
                      onClick={async () => {
                        await deleteReminder(r.id);
                        await reload();
                      }}
                    />
                  </HStack>
                </Stack>
              ))}
            </VStack>
          </CardBody>
        </Card>

        {/* Editor */}
        <Card bg={cardBg} border="1px" borderColor={border}>
          <CardBody>
            <Stack
              direction={{ base: "column", sm: "row" }}
              justify="space-between"
              align={{ base: "flex-start", sm: "center" }}
              mb={3}
              spacing={3}
            >
              <Heading size="sm">
                {editing?.id ? "Edit Reminder" : "Create Reminder"}
              </Heading>
              {editing && (
                <IconButton
                  aria-label="Save"
                  icon={<CheckIcon />}
                  onClick={onSave}
                  size="sm"
                  alignSelf={{ base: "flex-end", sm: "auto" }}
                />
              )}
            </Stack>

            {!editing && (
              <Text fontSize="sm" color={sub}>
                Select a reminder to edit, or click New.
              </Text>
            )}

            {editing && (
              <VStack align="stretch" spacing={{ base: 3, md: 4 }}>
                <FormControl>
                  <FormLabel>Type</FormLabel>
                  <Select
                    value={editing.type}
                    onChange={(e) => setEditing({ ...editing, type: e.target.value })}
                  >
                    {REMINDER_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Title</FormLabel>
                  <Input
                    placeholder="e.g., Morning Meditation"
                    value={editing.title}
                    onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Message</FormLabel>
                  <Input
                    placeholder="Optional message shown in the alert"
                    value={editing.message || ""}
                    onChange={(e) => setEditing({ ...editing, message: e.target.value })}
                  />
                </FormControl>

                {/* Recurrence + Time responsive row */}
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 3, md: 4 }}>
                  <FormControl>
                    <FormLabel>Recurrence</FormLabel>
                    <Select
                      value={editing.recurrence}
                      onChange={(e) => setEditing({ ...editing, recurrence: e.target.value })}
                    >
                      {RECURRENCES.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Time</FormLabel>
                    <Input
                      type="time"
                      value={editing.time}
                      onChange={(e) => setEditing({ ...editing, time: e.target.value })}
                    />
                  </FormControl>
                </SimpleGrid>

                {editing.recurrence !== "daily" && (
                  <FormControl>
                    <FormLabel>
                      {editing.recurrence === "once" ? "Date" : "Start Date"}
                    </FormLabel>
                    <Input
                      type="date"
                      value={editing.startDate?.slice(0, 10) || ""}
                      onChange={(e) => setEditing({ ...editing, startDate: e.target.value })}
                    />
                  </FormControl>
                )}

                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">Enabled</FormLabel>
                  <Switch
                    isChecked={!!editing.enabled}
                    onChange={(e) => setEditing({ ...editing, enabled: e.target.checked })}
                  />
                </FormControl>

                <HStack spacing={3} flexWrap="wrap">
                  <Button colorScheme="purple" onClick={onSave} w={{ base: "full", sm: "auto" }}>
                    Save
                  </Button>
                  <Button variant="ghost" onClick={() => setEditing(null)} w={{ base: "full", sm: "auto" }}>
                    Cancel
                  </Button>
                </HStack>

                <Text fontSize="xs" color={sub}>
                  Tip: enable browser notifications when prompted so reminders can appear as native
                  notifications.
                </Text>
              </VStack>
            )}
          </CardBody>
        </Card>
      </SimpleGrid>
    </Box>
  );
}
