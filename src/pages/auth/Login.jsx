import React, { useState } from 'react';
import {
  VStack, HStack, Heading, FormControl, FormLabel, Input, Button, Link, useToast
} from '@chakra-ui/react';
import { LogIn, Mail } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import AuthShell from '../../components/AuthShell';
import GradientIcon from '../../components/GradientIcon';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast({ title: error.message, status: 'error' });
    toast({ title: 'Welcome back!', status: 'success' });
    navigate('/account');
  };

  return (
    <AuthShell title="Welcome back" subtitle="Continue shaping time with your data.">
      <form onSubmit={onSubmit} noValidate>
        <VStack spacing={5} align="stretch">
          <HStack justify="space-between">
            <Heading as="h1" size="md">Log in</Heading>
            <GradientIcon as={LogIn} aria-hidden="true" focusable="false" />
          </HStack>

          <FormControl id="email" isRequired>
            <FormLabel htmlFor="email">Email</FormLabel>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
            />
          </FormControl>

          <FormControl id="password" isRequired>
            <FormLabel htmlFor="password">Password</FormLabel>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
            />
          </FormControl>

          <Button type="submit" colorScheme="purple" isLoading={loading} size="lg">
            Log in
          </Button>

          <HStack justify="space-between" fontSize="sm" flexWrap="wrap" gap={2}>
            <Link as={RouterLink} to="/signup">Create account</Link>
            <Link as={RouterLink} to="/forgot">Forgot password?</Link>
          </HStack>

          <Button
            variant="outline"
            leftIcon={<GradientIcon as={Mail} aria-label="Magic link" />}
            onClick={async ()=>{
              const { error } = await supabase.auth.signInWithOtp({
                email,
                options:{ emailRedirectTo: `${window.location.origin}/reset-password` }
              });
              if (error) toast({ title: error.message, status: 'error' });
              else toast({ title: 'Magic link sent to your email', status: 'success' });
            }}
          >
            Send magic link
          </Button>
        </VStack>
      </form>
    </AuthShell>
  );
}
