import React, { useState } from 'react';
import {
  VStack, HStack, Heading, Text, FormControl, FormLabel, Input, Button, Link,
  InputGroup, InputRightElement, useToast, IconButton, FormErrorMessage
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { UserPlus, LogIn } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import AuthShell from '../../components/AuthShell';
import GradientIcon from '../../components/GradientIcon';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

// console.log('🔧 Supabase URL in use:', import.meta.env.VITE_SUPABASE_URL);

export default function Signup() {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const pwdMismatch = password && confirm && password !== confirm;
  const pwdTooShort = password && password.length < 8;

  const onSubmit = async (e) => {
    e.preventDefault();
    if (pwdMismatch) return toast({ title: 'Passwords do not match', status: 'error' });
    if (pwdTooShort) return toast({ title: 'Password must be at least 8 characters', status: 'error' });

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/reset-password`,
      },
    });
    setLoading(false);

    if (error) return toast({ title: error.message, status: 'error' });
    toast({
      title: 'Confirm your email',
      description: 'We sent a link to your inbox. Open it to finish signup.',
      status: 'success',
    });
    navigate('/login');
  };

  return (
    <AuthShell title="Create your AI Time Shifter account" subtitle="Luxury-grade, privacy-first insights.">
      <form onSubmit={onSubmit} noValidate>
        <VStack spacing={5} align="stretch">
          <HStack justify="space-between">
            <Heading as="h1" size="md">Sign up</Heading>
            <GradientIcon as={UserPlus} aria-hidden="true" focusable="false" />
          </HStack>

          <FormControl id="full-name" isRequired>
            <FormLabel htmlFor="full-name">Full name</FormLabel>
            <Input
              id="full-name"
              name="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Alex Morgan"
              required
            />
          </FormControl>

          <FormControl id="email" isRequired>
            <FormLabel htmlFor="email">Email</FormLabel>
            <Input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </FormControl>

          <FormControl id="password" isRequired isInvalid={pwdTooShort}>
            <FormLabel htmlFor="password">Password</FormLabel>
            <InputGroup>
              <Input
                id="password"
                name="password"
                type={show1 ? 'text' : 'password'}
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                aria-invalid={pwdTooShort ? 'true' : 'false'}
                aria-describedby="pwd-help"
                autoComplete="new-password"
                required
              />
              <InputRightElement>
                <IconButton
                  aria-label={show1 ? 'Hide password' : 'Show password'}
                  variant="ghost"
                  icon={show1 ? <ViewOffIcon/> : <ViewIcon/>}
                  onClick={()=>setShow1(s=>!s)}
                />
              </InputRightElement>
            </InputGroup>
            <FormErrorMessage id="pwd-help">Password must be at least 8 characters</FormErrorMessage>
          </FormControl>

          <FormControl id="confirm-password" isRequired isInvalid={pwdMismatch}>
            <FormLabel htmlFor="confirm-password">Confirm password</FormLabel>
            <InputGroup>
              <Input
                id="confirm-password"
                name="confirmPassword"
                type={show2 ? 'text' : 'password'}
                value={confirm}
                onChange={(e)=>setConfirm(e.target.value)}
                aria-invalid={pwdMismatch ? 'true' : 'false'}
                autoComplete="new-password"
                required
              />
              <InputRightElement>
                <IconButton
                  aria-label={show2 ? 'Hide password' : 'Show password'}
                  variant="ghost"
                  icon={show2 ? <ViewOffIcon/> : <ViewIcon/>}
                  onClick={()=>setShow2(s=>!s)}
                />
              </InputRightElement>
            </InputGroup>
            <FormErrorMessage>Passwords do not match</FormErrorMessage>
          </FormControl>

          <Button
            type="submit"
            colorScheme="purple"
            isLoading={loading}
            size="lg"
            isDisabled={!email || !fullName || !password || !confirm || pwdMismatch || pwdTooShort}
          >
            Create account
          </Button>

          <HStack justify="space-between" fontSize="sm" flexWrap="wrap" gap={2}>
            <Text>Already have an account?</Text>
            <Link as={RouterLink} to="/login">
              <HStack>
                <GradientIcon as={LogIn} aria-hidden="true" focusable="false" />
                <Text>Log in</Text>
              </HStack>
            </Link>
          </HStack>
        </VStack>
      </form>
    </AuthShell>
  );
}
