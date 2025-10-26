// src/pages/Account.jsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Grid,
  GridItem,
  Container,
  HStack,
  VStack,
  Heading,
  Text,
  Button,
  Input,
  Textarea,
  FormControl,
  FormLabel,
  FormHelperText,
  Select,
  Switch,
  useToast,
  useColorModeValue,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
  Divider,
  Code,
  Badge,
  Kbd,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Skeleton,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  NumberInput,
  NumberInputField,
  Collapse,
  IconButton,
  Stack, // ← for responsive header actions
} from '@chakra-ui/react';
import { Save, LogOut, Shield, Trash2, Info, Link as LinkIcon, User, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getProfile, upsertProfile, deleteAccount } from '../services/profileService';
import GlassCard from '../components/GlassCard';
import GradientIcon from '../components/GradientIcon';
import AvatarUploader from '../components/AvatarUploader';

export default function Account() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState(null);

  // Preferences (human-friendly form) + synced JSON
  const [prefs, setPrefs] = useState({});
  const [prefsText, setPrefsText] = useState('{}');
  const [prefsError, setPrefsError] = useState('');
  const [prefsAdvancedOpen, setPrefsAdvancedOpen] = useState(false);

  const [tagInput, setTagInput] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const border = useColorModeValue('gray.200', 'whiteAlpha.300');
  const cardBg = useColorModeValue('white', 'gray.800');
  const headerBg = useColorModeValue(
    'linear-gradient(120deg,#6d28d9 0%,#7c3aed 50%,#a855f7 100%)',
    'linear-gradient(120deg,#6d28d9 0%,#7c3aed 50%,#a855f7 100%)'
  );

  // Utility: update prefs and keep JSON in sync
  const setPrefsAndSync = (next) => {
    setPrefs(next);
    setPrefsText(JSON.stringify(next ?? {}, null, 2));
    setPrefsError('');
  };

  // Load existing profile
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const p = await getProfile();
        if (!mounted) return;

        setProfile({
          full_name: p?.full_name || '',
          bio: p?.bio || '',
          avatar_url: p?.avatar_url || '',
          phone: p?.phone || '',
          timezone: p?.timezone || '',
          location: p?.location || '',
          website: p?.website || '',
          birthday: p?.birthday || '',
          headline: p?.headline || '',
          tags: Array.isArray(p?.tags) ? p.tags : [],
          // notifications
          notify_news: !!p?.notify_news,
          notify_product: !!p?.notify_product,
          notify_security: true,
        });

        const initialPrefs = p?.prefs || {};
        setPrefsAndSync(initialPrefs);
      } catch (e) {
        toast({ title: 'Failed to load profile', description: e.message, status: 'error' });
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [toast]);

  // When user types JSON manually, try to parse and push into form state
  const onPrefsTextChange = (val) => {
    setPrefsText(val);
    try {
      const parsed = JSON.parse(val || '{}');
      setPrefs(parsed);
      setPrefsError('');
    } catch {
      setPrefsError('Invalid JSON');
    }
  };

  // Derived: valid JSON badge / key count
  const parsedPrefs = useMemo(() => {
    try {
      const obj = JSON.parse(prefsText || '{}');
      return obj;
    } catch {
      return null;
    }
  }, [prefsText]);

  const onSave = async () => {
    if (!profile) return;
    if (prefsError) {
      toast({ title: 'Preferences JSON has errors', status: 'error' });
      return;
    }

    setSaving(true);
    try {
      // Clean tags
      const cleanTags = (profile.tags || [])
        .map((t) => (t ?? '').trim())
        .filter(Boolean);

      await upsertProfile({
        full_name: profile.full_name?.trim() || '',
        bio: profile.bio || '',
        avatar_url: profile.avatar_url || '',
        phone: profile.phone || '',
        timezone: profile.timezone || '',
        location: profile.location || '',
        website: profile.website || '',
        birthday: profile.birthday ?? null,
        headline: profile.headline || '',
        tags: cleanTags,
        prefs: prefs || {},
        notify_news: !!profile.notify_news,
        notify_product: !!profile.notify_product,
        notify_security: true,
      });
      toast({ title: 'Profile saved', status: 'success' });
    } catch (e) {
      toast({ title: 'Save failed', description: e.message, status: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const onSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const addTag = () => {
    const v = tagInput.trim();
    if (!v) return;
    setProfile((p) => ({ ...p, tags: [...(p?.tags || []), v] }));
    setTagInput('');
  };
  const removeTag = (i) => setProfile((p) => ({ ...p, tags: (p?.tags || []).filter((_, idx) => idx !== i) }));

  const tzOptions = [
    'UTC',
    'America/Los_Angeles',
    'America/New_York',
    'Europe/London',
    'Europe/Berlin',
    'Asia/Kolkata',
    'Asia/Singapore',
    'Australia/Sydney',
  ];

  // Peak hours options (HH:MM)
  const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);
  const peakStart = (prefs?.peakHours || '').split('-')[0] || '';
  const peakEnd = (prefs?.peakHours || '').split('-')[1] || '';

  const setPeakHours = (start, end) => {
    if (!start && !end) {
      const next = { ...prefs };
      delete next.peakHours;
      setPrefsAndSync(next);
      return;
    }
    if (start && end) {
      setPrefsAndSync({ ...prefs, peakHours: `${start}-${end}` });
    } else {
      const partial = start ? `${start}-` : `-${end}`;
      setPrefsAndSync({ ...prefs, peakHours: partial });
    }
  };

  return (
    <Box minH="100vh">
      {/* Luxe Header with the single H1 for the page */}
      <Box
        bg={headerBg}
        color="white"
        py={{ base: 8, md: 12 }}
        px={{ base: 4, md: 8 }}
        borderBottomRadius={{ base: '2xl', md: '3xl' }}
        boxShadow="0 20px 40px rgba(0,0,0,0.25)"
        position="relative"
        overflow="hidden"
      >
        <Container maxW="7xl">
          <HStack justify="space-between" align="flex-start" spacing={6} flexWrap="wrap">
            <VStack align="start" spacing={2}>
              <HStack>
                <GradientIcon as={User} aria-hidden="true" focusable="false" />
                {/* <-- This is the only h1 on the page */}
                <Heading as="h1" size="xl" fontWeight="800" letterSpacing=".3px">
                  Your Account
                </Heading>
              </HStack>
              <Text opacity={0.85}>
                Refine your identity, preferences, and notifications. Beautifully presented.
              </Text>
            </VStack>

            {/* Responsive actions: stack on mobile, row on larger screens */}
            <Stack
              direction={{ base: 'column', sm: 'row' }}
              spacing={3}
              w={{ base: '100%', sm: 'auto' }}
              align={{ base: 'stretch', sm: 'center' }}
            >
              <Button
                leftIcon={<GradientIcon as={Save} aria-hidden="true" focusable="false" />}
                colorScheme="whiteAlpha"
                variant="solid"
                onClick={onSave}
                isLoading={saving || loading}
                w={{ base: '100%', sm: 'auto' }}
              >
                Save
              </Button>
              <Button
                leftIcon={<GradientIcon as={LogOut} aria-hidden="true" focusable="false" />}
                variant="outline"
                color="white"
                borderColor="whiteAlpha.600"
                onClick={onSignOut}
                w={{ base: '100%', sm: 'auto' }}
              >
                Sign out
              </Button>
            </Stack>
          </HStack>
        </Container>
      </Box>

      <Container maxW="7xl" py={{ base: 6, md: 10 }} px={{ base: 4, md: 8 }}>
        {/* Single column on mobile/tablet; split on large screens */}
        <Grid
          templateColumns={{ base: '1fr', lg: '2fr 1fr' }}
          gap={{ base: 6, md: 8 }}
          alignItems="start"
        >
          {/* Left column: Forms */}
          <GridItem>
            {/* Profile + Avatar */}
            <GlassCard title="Profile">
              {loading ? (
                <VStack align="stretch" spacing={4}>
                  <Skeleton height="64px" />
                  <Skeleton height="64px" />
                </VStack>
              ) : (
                <Grid templateColumns={{ base: '1fr', md: 'auto 1fr' }} gap={6} alignItems="center">
                  <VStack align="start">
                    <AvatarUploader
                      initialUrl={profile?.avatar_url}
                      onUploaded={(url) => setProfile((p) => ({ ...p, avatar_url: url }))}
                    />
                  </VStack>

                  <VStack align="stretch" spacing={4}>
                    <FormControl>
                      <FormLabel>Full name</FormLabel>
                      <Input
                        value={profile?.full_name || ''}
                        onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))}
                        placeholder="Jane Doe"
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Headline</FormLabel>
                      <Input
                        value={profile?.headline || ''}
                        onChange={(e) => setProfile((p) => ({ ...p, headline: e.target.value }))}
                        placeholder="Founder @ Atelier, Lifelong learner"
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Bio</FormLabel>
                      <Textarea
                        rows={4}
                        value={profile?.bio || ''}
                        onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                        placeholder="Tell us about yourself…"
                      />
                    </FormControl>
                  </VStack>
                </Grid>
              )}
            </GlassCard>

            {/* Contact & Basics */}
            <GlassCard title="Contact & Basics">
              <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
                <FormControl>
                  <FormLabel>Phone</FormLabel>
                  <Input
                    value={profile?.phone || ''}
                    onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="+1 555-123-4567"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Website</FormLabel>
                  <Input
                    value={profile?.website || ''}
                    onChange={(e) => setProfile((p) => ({ ...p, website: e.target.value }))}
                    placeholder="https://example.com"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Location</FormLabel>
                  <Input
                    value={profile?.location || ''}
                    onChange={(e) => setProfile((p) => ({ ...p, location: e.target.value }))}
                    placeholder="City, Country"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Timezone</FormLabel>
                  <Select
                    placeholder="Select timezone"
                    value={profile?.timezone || ''}
                    onChange={(e) => setProfile((p) => ({ ...p, timezone: e.target.value }))}
                  >
                    {tzOptions.map((z) => (
                      <option key={z} value={z}>
                        {z}
                      </option>
                    ))}
                  </Select>
                  <FormHelperText>
                    <Kbd>Tip</Kbd> Set this for smarter scheduling.
                  </FormHelperText>
                </FormControl>
                <FormControl>
                  <FormLabel>Birthday</FormLabel>
                  <Input
                    type="date"
                    value={profile?.birthday || ''}
                    onChange={(e) => setProfile((p) => ({ ...p, birthday: e.target.value || null }))}
                  />
                </FormControl>
              </Grid>
            </GlassCard>

            {/* Professional Tags */}
            <GlassCard title="Expertise & Interests">
              <VStack align="stretch" spacing={3}>
                <HStack>
                  <Input
                    placeholder="Add a tag (e.g., design, fitness, finance)"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addTag()}
                  />
                  <Button onClick={addTag} colorScheme="purple">
                    Add
                  </Button>
                </HStack>
                <Wrap>
                  {(profile?.tags || []).map((t, i) => (
                    <WrapItem key={`${t}-${i}`}>
                      <Tag size="md" colorScheme="purple" variant="subtle" borderRadius="full">
                        <TagLabel>{t}</TagLabel>
                        <TagCloseButton onClick={() => removeTag(i)} />
                      </Tag>
                    </WrapItem>
                  ))}
                </Wrap>
              </VStack>
            </GlassCard>

            {/* Preferences – Human-friendly controls + Advanced JSON */}
            <GlassCard title="Preferences">
              <VStack align="stretch" spacing={5}>
                <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
                  <FormControl>
                    <FormLabel>Preferred timezone (for suggestions)</FormLabel>
                    <Select
                      placeholder="Same as account timezone"
                      value={prefs?.timezone ?? ''}
                      onChange={(e) => {
                        const val = e.target.value || undefined;
                        const next = { ...prefs };
                        if (val) next.timezone = val;
                        else delete next.timezone;
                        setPrefsAndSync(next);
                      }}
                    >
                      {tzOptions.map((z) => (
                        <option key={z} value={z}>
                          {z}
                        </option>
                      ))}
                    </Select>
                    <FormHelperText>If empty, we’ll fall back to your account timezone.</FormHelperText>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Theme</FormLabel>
                    <Select
                      placeholder="System"
                      value={prefs?.theme ?? ''}
                      onChange={(e) => {
                        const val = e.target.value || undefined;
                        const next = { ...prefs };
                        if (val) next.theme = val;
                        else delete next.theme;
                        setPrefsAndSync(next);
                      }}
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="system">System</option>
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Peak hours (start)</FormLabel>
                    <Select placeholder="—" value={peakStart} onChange={(e) => setPeakHours(e.target.value, peakEnd)}>
                      {hours.map((h) => (
                        <option key={`s-${h}`} value={h}>
                          {h}
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Peak hours (end)</FormLabel>
                    <Select placeholder="—" value={peakEnd} onChange={(e) => setPeakHours(peakStart, e.target.value)}>
                      {hours.map((h) => (
                        <option key={`e-${h}`} value={h}>
                          {h}
                        </option>
                      ))}
                    </Select>
                    <FormHelperText>We’ll prioritize suggestions within this window.</FormHelperText>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Weekly focus goal (hours)</FormLabel>
                    <NumberInput
                      min={0}
                      value={prefs?.weeklyFocusHours ?? ''}
                      onChange={(_, n) => {
                        const next = { ...prefs };
                        if (Number.isFinite(n) && n >= 0) next.weeklyFocusHours = n;
                        else delete next.weeklyFocusHours;
                        setPrefsAndSync(next);
                      }}
                    >
                      <NumberInputField placeholder="e.g., 5" />
                    </NumberInput>
                  </FormControl>

                  <FormControl
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    p={3}
                    border={`1px solid ${border}`}
                    borderRadius="md"
                    bg={cardBg}
                  >
                    <Box>
                      <FormLabel m={0}>Tips & best practices</FormLabel>
                      <FormHelperText>Occasional helpful suggestions in the app.</FormHelperText>
                    </Box>
                    <Switch
                      isChecked={!!prefs?.tips}
                      onChange={(e) => setPrefsAndSync({ ...prefs, tips: e.target.checked })}
                      colorScheme="purple"
                    />
                  </FormControl>
                </Grid>

                {/* Advanced JSON editor (syncs both ways) */}
                <HStack justify="space-between" align="center">
                  <HStack>
                    <Badge colorScheme={prefsError ? 'red' : 'green'}>
                      {prefsError ? 'Invalid JSON' : 'Valid JSON'}
                    </Badge>
                    {!prefsError && (
                      <Text fontSize="xs" color="gray.500">
                        {Object.keys(parsedPrefs || {}).length} keys
                      </Text>
                    )}
                  </HStack>
                  <HStack>
                    <Text fontSize="sm" color="gray.500">
                      Advanced (JSON)
                    </Text>
                    <IconButton
                      aria-label="Toggle advanced"
                      size="sm"
                      variant="ghost"
                      icon={prefsAdvancedOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      onClick={() => setPrefsAdvancedOpen((v) => !v)}
                    />
                  </HStack>
                </HStack>

                <Collapse in={prefsAdvancedOpen} animateOpacity>
                  <Textarea
                    fontFamily="mono"
                    rows={10}
                    value={prefsText}
                    onChange={(e) => onPrefsTextChange(e.target.value)}
                    aria-label="Preferences JSON"
                  />
                  <Text fontSize="xs" color="gray.500" mt={2}>
                    Example:{' '}
                    <Code>
                      {'{"timezone":"America/Los_Angeles","peakHours":"10:00-12:00"}'}
                    </Code>
                  </Text>
                </Collapse>

                <HStack justify="flex-end" flexWrap="wrap" gap={2}>
                  <Button variant="outline" onClick={() => setPrefsAndSync({})}>
                    Reset to defaults
                  </Button>
                  <Button leftIcon={<GradientIcon as={Save} aria-hidden="true" focusable="false" />} onClick={onSave} isLoading={saving}>
                    Save Preferences
                  </Button>
                </HStack>
              </VStack>
            </GlassCard>

            {/* Notifications */}
            <GlassCard title="Notifications">
              <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={6}>
                <FormControl
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  border={`1px solid ${border}`}
                  p={4}
                  borderRadius="md"
                  bg={cardBg}
                >
                  <Box>
                    <FormLabel m={0}>Product updates</FormLabel>
                    <FormHelperText>Be the first to know about new features.</FormHelperText>
                  </Box>
                  <Switch
                    isChecked={!!profile?.notify_product}
                    onChange={(e) => setProfile((p) => ({ ...p, notify_product: e.target.checked }))}
                    colorScheme="purple"
                  />
                </FormControl>

                <FormControl
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  border={`1px solid ${border}`}
                  p={4}
                  borderRadius="md"
                  bg={cardBg}
                >
                  <Box>
                    <FormLabel m={0}>News & tips</FormLabel>
                    <FormHelperText>Occasional best practices and inspiration.</FormHelperText>
                  </Box>
                  <Switch
                    isChecked={!!profile?.notify_news}
                    onChange={(e) => setProfile((p) => ({ ...p, notify_news: e.target.checked }))}
                    colorScheme="purple"
                  />
                </FormControl>

                <FormControl
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  border={`1px solid ${border}`}
                  p={4}
                  borderRadius="md"
                  bg={cardBg}
                >
                  <Box>
                    <FormLabel m={0}>Security alerts</FormLabel>
                    <FormHelperText>We’ll always send these when important.</FormHelperText>
                  </Box>
                  <Switch isChecked isDisabled colorScheme="purple" />
                </FormControl>
              </Grid>
            </GlassCard>

            {/* Danger zone */}
            <GlassCard title="Danger Zone">
              <HStack justify="space-between" align="center" flexWrap="wrap" gap={3}>
                <HStack>
                  <GradientIcon as={Shield} aria-hidden="true" focusable="false" />
                  <Text color="gray.600">
                    Delete account requires a server role. For now, this will sign you out after clearing profile data.
                  </Text>
                </HStack>
                <Button
                  leftIcon={<Trash2 size={16} />}
                  variant="outline"
                  colorScheme="red"
                  onClick={async () => {
                    try {
                      await deleteAccount();
                    } finally {
                      await supabase.auth.signOut();
                      window.location.href = '/login';
                    }
                  }}
                >
                  Delete / Sign out
                </Button>
              </HStack>
            </GlassCard>
          </GridItem>

          {/* Right column: Snapshot & Connected apps */}
          <GridItem>
            {/* Profile Snapshot */}
            <GlassCard title="Profile Snapshot">
              <Grid templateColumns="1fr" gap={4}>
                <Stat>
                  <StatLabel>Completion</StatLabel>
                  <StatNumber>
                    {(() => {
                      const filled = [
                        profile?.full_name,
                        profile?.bio,
                        profile?.timezone,
                        profile?.location,
                        profile?.website,
                      ].filter(Boolean).length;
                      return Math.round((filled / 5) * 100);
                    })()}
                    %
                  </StatNumber>
                  <StatHelpText>Complete your profile for better recommendations</StatHelpText>
                </Stat>
                <Divider />
                <HStack spacing={3} color="gray.500">
                  <Info size={16} />
                  <Text fontSize="sm">
                    Tip: Use a clear headline and add a few tags so the coach can tailor suggestions.
                  </Text>
                </HStack>
              </Grid>
            </GlassCard>

            {/* Connected Apps (placeholders) */}
            <GlassCard title="Connected Apps">
              <VStack align="stretch" spacing={3}>
                <HStack justify="space-between" border={`1px solid ${border}`} p={3} borderRadius="md">
                  <HStack>
                    <LinkIcon size={16} />
                    <Text>Google Calendar</Text>
                  </HStack>
                  <Badge colorScheme="purple" variant="subtle">
                    Coming soon
                  </Badge>
                </HStack>
                <HStack justify="space-between" border={`1px solid ${border}`} p={3} borderRadius="md">
                  <HStack>
                    <LinkIcon size={16} />
                    <Text>Apple Health / Fitbit</Text>
                  </HStack>
                  <Badge colorScheme="purple" variant="subtle">
                    Coming soon
                  </Badge>
                </HStack>
              </VStack>
            </GlassCard>

            {/* Power tips */}
            <GlassCard title="Power Tips">
              <VStack align="stretch" spacing={3}>
                <Text fontSize="sm" color="gray.500">
                  Use <Kbd>⌘</Kbd>/<Kbd>Ctrl</Kbd> + <Kbd>S</Kbd> to save quickly. Add your timezone for smarter
                  schedules.
                </Text>
                <Button size="sm" variant="outline" onClick={onOpen}>
                  View shortcuts
                </Button>
              </VStack>
            </GlassCard>
          </GridItem>
        </Grid>
      </Container>

      {/* Shortcuts modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Keyboard Shortcuts</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack align="stretch" spacing={4}>
              <HStack>
                <Kbd>⌘/Ctrl</Kbd> + <Kbd>S</Kbd>
                <Text>Save profile</Text>
              </HStack>
              <HStack>
                <Kbd>Enter</Kbd>
                <Text>Add tag</Text>
              </HStack>
              <HStack>
                <Kbd>Esc</Kbd>
                <Text>Close dialogs</Text>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
