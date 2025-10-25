import React, { useState } from 'react';
import { VStack, Heading, Text, FormControl, FormLabel, Input, Button, useToast } from '@chakra-ui/react';
import { supabase } from '../../lib/supabase';
import AuthShell from '../../components/AuthShell';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) return toast({ title: error.message, status: 'error' });
    toast({ title: 'Password reset link sent', status: 'success' });
  };

  return (
    <AuthShell title="Forgot your password?" subtitle="We’ll email you a secure reset link.">
      <form onSubmit={onSubmit}>
        <VStack spacing={5} align="stretch">
          <Heading size="md">Reset password</Heading>
          <FormControl isRequired>
            <FormLabel>Email</FormLabel>
            <Input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} />
          </FormControl>
          <Button type="submit" colorScheme="purple" isLoading={loading} size="lg">Send reset link</Button>
        </VStack>
      </form>
    </AuthShell>
  );
}
