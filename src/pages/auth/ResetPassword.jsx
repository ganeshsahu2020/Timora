import React, { useState, useEffect } from 'react';
import {
  VStack, Heading, Text, FormControl, FormLabel, Input, Button,
  useToast, InputGroup, InputRightElement, IconButton, FormErrorMessage
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { supabase } from '../../lib/supabase';
import AuthShell from '../../components/AuthShell';
import { useNavigate } from 'react-router-dom';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const url = new URL(window.location.href);
        const search = url.searchParams;
        const hashParams = new URLSearchParams(url.hash.replace(/^#/, ''));

        const code = search.get('code') || hashParams.get('code');
        const access_token = hashParams.get('access_token');
        const refresh_token = hashParams.get('refresh_token');
        const type = search.get('type') || hashParams.get('type');

        // Try PKCE first (query or hash may contain "code")
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
          if (error) {
            console.error('exchangeCodeForSession error:', error);
            toast({ title: error.message || 'This link is invalid/expired.', status: 'error' });
          }
        }
        // Fallback: implicit/hash flow with tokens
        else if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({ access_token, refresh_token });
          if (error) {
            console.error('setSession error:', error);
            toast({ title: error.message || 'Could not start session from link.', status: 'error' });
          }
        }

        const { data: { user } } = await supabase.auth.getUser();
        setOk(!!user);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [toast]);

  const pwdMismatch = password && confirm && password !== confirm;
  const pwdTooShort = password && password.length < 8;

  const onSubmit = async (e) => {
    e.preventDefault();
    if (pwdMismatch) return toast({ title: 'Passwords do not match', status: 'error' });
    if (pwdTooShort) return toast({ title: 'Password must be at least 8 characters', status: 'error' });

    const { error } = await supabase.auth.updateUser({ password });
    if (error) return toast({ title: error.message, status: 'error' });

    toast({ title: 'Password updated. Please log in.', status: 'success' });
    navigate('/login');
  };

  return (
    <AuthShell
      title="Set a new password"
      subtitle={ok ? 'Almost done.' : 'Open the emailed link first to start this flow.'}
    >
      <form onSubmit={onSubmit}>
        <VStack spacing={5} align="stretch">
          <Heading size="md">Reset</Heading>

          <FormControl isRequired isInvalid={pwdTooShort}>
            <FormLabel>New password</FormLabel>
            <InputGroup>
              <Input
                type={show1 ? 'text' : 'password'}
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
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
            <FormErrorMessage>Password must be at least 8 characters</FormErrorMessage>
          </FormControl>

          <FormControl isRequired isInvalid={pwdMismatch}>
            <FormLabel>Confirm new password</FormLabel>
            <InputGroup>
              <Input
                type={show2 ? 'text' : 'password'}
                value={confirm}
                onChange={(e)=>setConfirm(e.target.value)}
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
            isDisabled={!ok || !password || !confirm || pwdMismatch || pwdTooShort}
            isLoading={loading}
          >
            Update password
          </Button>

          {!ok && (
            <Text fontSize="sm" color="gray.500">
              Tip: Open the link from the email again. If it’s expired, request a new reset.
            </Text>
          )}
        </VStack>
      </form>
    </AuthShell>
  );
}
