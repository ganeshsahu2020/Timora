// src/components/Navbar.jsx
import React, { useEffect, useState } from 'react';
import {
  HStack,
  IconButton,
  Spacer,
  Text,
  Tooltip,
  Button,
  useColorMode,
  useBreakpointValue,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerCloseButton,
  useDisclosure,
  VStack,
  useColorModeValue,
  Divider,
  Box,
} from '@chakra-ui/react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { HamburgerIcon } from '@chakra-ui/icons';
import {
  FaHome,
  FaChartLine,
  FaBrain,
  FaCog,
  FaDollarSign,
  FaMoon,
  FaSun,
  FaBed,
  FaHeartbeat,
  FaUserCircle,
  FaSignOutAlt,
  FaSignInAlt,
  FaUserPlus,
} from 'react-icons/fa';
import { supabase } from '../lib/supabase';
import TimoraLogo from './TimoraLogo';

export default function Navbar() {
  const { colorMode, toggleColorMode } = useColorMode();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [user, setUser] = useState(null);

  useEffect(() => {
    let sub;
    (async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data?.session?.user ?? null);
      const listener = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });
      sub = listener.data?.subscription;
    })();
    return () => { if (sub) sub.unsubscribe(); };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login', { replace: true });
  };

  const navItems = [
    { to: '/', label: 'Dashboard', icon: FaHome },
    { to: '/habits', label: 'Habits', icon: FaChartLine },
    { to: '/wealth', label: 'Wealth', icon: FaDollarSign },
    { to: '/sleep', label: 'Sleep', icon: FaBed },
    { to: '/recovery', label: 'Recovery', icon: FaHeartbeat },
    { to: '/insights', label: 'Insights', icon: FaBrain },
    { to: '/settings', label: 'Settings', icon: FaCog },
    { to: '/account', label: 'Account', icon: FaUserCircle },
  ];

  const bg = useColorModeValue('white', 'gray.900');
  const borderColor = useColorModeValue('blackAlpha.200', 'whiteAlpha.300');

  return (
    <Box
      as="nav"
      role="navigation"
      aria-label="Main navigation"
      px={{ base: 3, md: 6 }}
      py={3}
      display="flex"
      alignItems="center"
      gap={3}
      borderBottom="1px solid"
      borderColor={borderColor}
      bg={bg}
      position="sticky"
      top={0}
      zIndex={20}
      backdropFilter="blur(8px)"
    >
      {/* Brand */}
      <HStack spacing={3} align="center">
        <Box as={RouterLink} to="/" aria-label="Go to dashboard" display="inline-flex" alignItems="center">
          <TimoraLogo mode="wordmark" size={28} />
        </Box>
      </HStack>

      {isMobile ? (
        <>
          <Spacer />
          <HStack spacing={2}>
            <Tooltip label={colorMode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
              <IconButton
                aria-label="Toggle color mode"
                onClick={toggleColorMode}
                size="sm"
                variant="ghost"
                icon={colorMode === 'light' ? <FaMoon /> : <FaSun />}
              />
            </Tooltip>
            <IconButton aria-label="Open menu" onClick={onOpen} size="sm" variant="ghost" icon={<HamburgerIcon />} />
          </HStack>

          <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
            <DrawerOverlay />
            <DrawerContent>
              <DrawerCloseButton />
              <DrawerHeader>
                <HStack>
                  <TimoraLogo mode="icon" size={24} showWordmark={false} />
                  <Text>Timora</Text>
                </HStack>
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Small Habits, Big Momentum.
                </Text>
              </DrawerHeader>
              <DrawerBody>
                <VStack as="div" align="stretch" spacing={3} mt={4}>
                  {navItems.map((item) => {
                    const IconComponent = item.icon;
                    const active = location.pathname === item.to;
                    return (
                      <Button
                        key={item.to}
                        as={RouterLink}
                        to={item.to}
                        variant={active ? 'solid' : 'ghost'}
                        colorScheme={active ? 'purple' : undefined}
                        onClick={onClose}
                        justifyContent="flex-start"
                        leftIcon={<IconComponent aria-hidden="true" focusable="false" />}
                        aria-current={active ? 'page' : undefined}
                      >
                        {item.label}
                      </Button>
                    );
                  })}

                  <Divider my={3} />

                  {user ? (
                    <Button
                      leftIcon={<FaSignOutAlt aria-hidden="true" focusable="false" />}
                      onClick={() => { onClose(); handleLogout(); }}
                      justifyContent="flex-start"
                      variant="ghost"
                    >
                      Logout
                    </Button>
                  ) : (
                    <>
                      <Button
                        as={RouterLink}
                        to="/login"
                        leftIcon={<FaSignInAlt aria-hidden="true" focusable="false" />}
                        onClick={onClose}
                        justifyContent="flex-start"
                        variant="outline"
                        colorScheme="purple"
                      >
                        Login
                      </Button>
                      <Button
                        as={RouterLink}
                        to="/signup"
                        leftIcon={<FaUserPlus aria-hidden="true" focusable="false" />}
                        onClick={onClose}
                        justifyContent="flex-start"
                        colorScheme="purple"
                      >
                        Signup
                      </Button>
                    </>
                  )}
                </VStack>
              </DrawerBody>
            </DrawerContent>
          </Drawer>
        </>
      ) : (
        <>
          <HStack spacing={4} ms={6}>
            {navItems.map((item) => {
              const IconComponent = item.icon;
              const active = location.pathname === item.to;
              return (
                <Button
                  key={item.to}
                  as={RouterLink}
                  to={item.to}
                  size="sm"
                  variant={active ? 'solid' : 'ghost'}
                  colorScheme={active ? 'purple' : undefined}
                  aria-current={active ? 'page' : undefined}
                  leftIcon={<IconComponent aria-hidden="true" focusable="false" />}
                >
                  {item.label}
                </Button>
              );
            })}
          </HStack>

          <Spacer />

          <HStack spacing={2}>
            <Tooltip label={colorMode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
              <IconButton
                aria-label="Toggle color mode"
                onClick={toggleColorMode}
                size="sm"
                variant="ghost"
                icon={colorMode === 'light' ? <FaMoon /> : <FaSun />}
              />
            </Tooltip>

            {user ? (
              <Button
                size="sm"
                variant="ghost"
                leftIcon={<FaSignOutAlt aria-hidden="true" focusable="false" />}
                onClick={handleLogout}
              >
                Logout
              </Button>
            ) : (
              <>
                <Button
                  as={RouterLink}
                  to="/login"
                  size="sm"
                  leftIcon={<FaSignInAlt aria-hidden="true" focusable="false" />}
                  variant="ghost"
                >
                  Login
                </Button>
                <Button
                  as={RouterLink}
                  to="/signup"
                  size="sm"
                  leftIcon={<FaUserPlus aria-hidden="true" focusable="false" />}
                  colorScheme="purple"
                >
                  Signup
                </Button>
              </>
            )}
          </HStack>
        </>
      )}
    </Box>
  );
}
