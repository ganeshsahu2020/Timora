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
  chakra,
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

// Export a shared height so layout can offset the main content
export const NAVBAR_HEIGHT = 72; // px (slightly taller for improved spacing)

function AnimatedIconContainer({ children, title }) {
  // A small wrapper that provides an animated gradient "badge" behind icons.
  // Icons are kept white for legibility, and the badge animates a gradient.
  return (
    <Box
      role="img"
      aria-label={title}
      className="timora-anim-icon"
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      borderRadius="full"
      sx={{
        width: { base: '34px', md: '36px' },
        height: { base: '34px', md: '36px' },
      }}
    >
      {children}
    </Box>
  );
}

export default function Navbar() {
  const { colorMode, toggleColorMode } = useColorMode();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [user, setUser] = useState(null);

  // Ensure the page content is offset by the fixed navbar height so it doesn't get overlapped.
  useEffect(() => {
    const prevPaddingTop = document.body.style.paddingTop || '';
    document.body.style.paddingTop = `${NAVBAR_HEIGHT}px`;
    return () => {
      document.body.style.paddingTop = prevPaddingTop;
    };
  }, []);

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

  // Aesthetic header treatment (glassmorphism)
  const bgLight = 'rgba(255,255,255,0.72)';
  const bgDark = 'rgba(17, 15, 23, 0.52)';
  const borderLight = 'rgba(0,0,0,0.06)';
  const borderDark = 'rgba(255,255,255,0.06)';
  const headerColor = useColorModeValue('gray.800', 'white');
  const borderColor = useColorModeValue(borderLight, borderDark);
  const bgColor = useColorModeValue(bgLight, bgDark);
  const buttonGhostColor = useColorModeValue('gray.700', 'whiteAlpha.900');
  const buttonHoverBg   = useColorModeValue('rgba(0,0,0,0.04)', 'rgba(255,255,255,0.04)');

  // Small helper to render a nav button with animated icon
  const NavButton = ({ item }) => {
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
        leftIcon={
          <AnimatedIconContainer>
            <IconComponent size={16} style={{ color: 'white' }} />
          </AnimatedIconContainer>
        }
        color={!active ? buttonGhostColor : undefined}
        _hover={{ bg: buttonHoverBg, transform: 'translateY(-2px)', boxShadow: 'lg' }}
        transition="all 200ms ease"
      >
        {item.label}
      </Button>
    );
  };

  return (
    <>
      {/* Inline CSS for animated gradients and subtle transitions (kept local to component) */}
      <chakra.style>
        {`
          /* Animated gradient used for icon badges */
          @keyframes timora-hue {
            0% { background-position: 0% 50% }
            50% { background-position: 100% 50% }
            100% { background-position: 0% 50% }
          }

          .timora-anim-icon {
            background: linear-gradient(90deg, #7C3AED 0%, #A78BFA 30%, #60a5fa 60%, #34d399 100%);
            background-size: 200% 200%;
            animation: timora-hue 4.5s ease infinite;
            box-shadow: 0 6px 18px rgba(99, 102, 241, 0.12);
            transition: transform 200ms ease, box-shadow 200ms ease, filter 200ms ease;
            -webkit-backdrop-filter: blur(4px);
            backdrop-filter: blur(4px);
            border: 1px solid rgba(255,255,255,0.06);
          }
          .timora-anim-icon svg {
            filter: drop-shadow(0 2px 6px rgba(0,0,0,0.18));
          }
          .timora-anim-icon:hover {
            transform: translateY(-3px) scale(1.06);
            box-shadow: 0 10px 30px rgba(99,102,241,0.18);
            filter: saturate(1.05);
          }

          /* Glass card subtle shadow */
          .timora-glass {
            background-clip: padding-box;
            -webkit-backdrop-filter: blur(8px);
            backdrop-filter: blur(8px);
            border-radius: 12px;
            border-style: solid;
          }

          /* small responsive helpers */
          @media (min-width: 768px) {
            /* slightly larger icon badges on desktop */
            .timora-anim-icon { width: 36px; height: 36px; }
          }
        `}
      </chakra.style>

      <Box
        as="nav"
        role="navigation"
        aria-label="Main navigation"
        // fixed header
        position="fixed"
        top={0}
        left={0}
        right={0}
        zIndex={1000}
        // visuals -> glassmorphism
        px={{ base: 3, md: 6 }}
        height={`${NAVBAR_HEIGHT}px`}
        boxSizing="border-box"
        display="flex"
        alignItems="center"
        gap={3}
        borderBottom="1px solid"
        borderColor={borderColor}
        bg={bgColor}
        color={headerColor}
        backdropFilter="blur(8px)"
        boxShadow={useColorModeValue('0 4px 20px rgba(12,18,30,0.06)', '0 4px 20px rgba(0,0,0,0.5)')}
        className="timora-glass"
      >
        {/* Brand */}
        <HStack spacing={3} align="center" h="100%">
          <Box
            as={RouterLink}
            to="/"
            aria-label="Go to dashboard"
            display="inline-flex"
            alignItems="center"
            transition="transform 180ms ease"
            _hover={{ transform: 'translateY(-2px)' }}
          >
            {/* The TimoraLogo is already designed to be responsive and animated */}
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
                  color={headerColor}
                  _hover={{ bg: buttonHoverBg }}
                  icon={
                    <AnimatedIconContainer>
                      {colorMode === 'light' ? <FaMoon size={14} style={{ color: 'white' }} /> : <FaSun size={14} style={{ color: 'white' }} />}
                    </AnimatedIconContainer>
                  }
                />
              </Tooltip>

              <IconButton
                aria-label="Open menu"
                onClick={onOpen}
                size="sm"
                variant="ghost"
                color={headerColor}
                _hover={{ bg: buttonHoverBg }}
                icon={<HamburgerIcon />}
              />
            </HStack>

            <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
              <DrawerOverlay />
              <DrawerContent>
                <DrawerCloseButton />
                <DrawerHeader>
                  <HStack>
                    <TimoraLogo mode="icon" size={28} showWordmark={false} />
                    <Text fontWeight="700" fontSize="lg">Timora</Text>
                  </HStack>
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    Small Habits, Big Momentum.
                  </Text>
                </DrawerHeader>
                <DrawerBody>
                  <VStack as="div" align="stretch" spacing={3} mt={4}>
                    {navItems.map((item) => (
                      <Button
                        key={item.to}
                        as={RouterLink}
                        to={item.to}
                        variant={location.pathname === item.to ? 'solid' : 'ghost'}
                        colorScheme={location.pathname === item.to ? 'purple' : undefined}
                        onClick={onClose}
                        justifyContent="flex-start"
                        leftIcon={
                          <AnimatedIconContainer>
                            <item.icon size={14} style={{ color: 'white' }} />
                          </AnimatedIconContainer>
                        }
                        aria-current={location.pathname === item.to ? 'page' : undefined}
                        _hover={{ transform: 'translateY(-2px)' }}
                      >
                        {item.label}
                      </Button>
                    ))}

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
            <HStack spacing={4} ms={6} h="100%" align="center">
              {navItems.map((item) => <NavButton key={item.to} item={item} />)}
            </HStack>

            <Spacer />

            <HStack spacing={2}>
              <Tooltip label={colorMode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
                <IconButton
                  aria-label="Toggle color mode"
                  onClick={toggleColorMode}
                  size="sm"
                  variant="ghost"
                  color={headerColor}
                  _hover={{ bg: buttonHoverBg }}
                  icon={
                    <AnimatedIconContainer>
                      {colorMode === 'light' ? <FaMoon size={14} style={{ color: 'white' }} /> : <FaSun size={14} style={{ color: 'white' }} />}
                    </AnimatedIconContainer>
                  }
                />
              </Tooltip>

              {user ? (
                <Button
                  size="sm"
                  variant="ghost"
                  leftIcon={
                    <AnimatedIconContainer>
                      <FaSignOutAlt size={14} style={{ color: 'white' }} />
                    </AnimatedIconContainer>
                  }
                  color={buttonGhostColor}
                  _hover={{ bg: buttonHoverBg }}
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
                    leftIcon={
                      <AnimatedIconContainer>
                        <FaSignInAlt size={14} style={{ color: 'white' }} />
                      </AnimatedIconContainer>
                    }
                    variant="ghost"
                    color={buttonGhostColor}
                    _hover={{ bg: buttonHoverBg }}
                  >
                    Login
                  </Button>
                  <Button
                    as={RouterLink}
                    to="/signup"
                    size="sm"
                    leftIcon={
                      <AnimatedIconContainer>
                        <FaUserPlus size={14} style={{ color: 'white' }} />
                      </AnimatedIconContainer>
                    }
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
    </>
  );
}