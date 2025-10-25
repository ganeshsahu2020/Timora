// src/components/AvatarUploader.jsx
import React, { useEffect, useRef, useState } from 'react';
import {
  HStack, VStack, Avatar, Button, Input, Text, useToast, Spinner,
} from '@chakra-ui/react';
import { uploadAvatar } from '../services/profileService';

export default function AvatarUploader({ initialUrl, onUploaded, maxMB = 5 }) {
  const [preview, setPreview] = useState(initialUrl || '');
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);
  const toast = useToast();

  useEffect(() => {
    // keep preview in sync if parent updates the url externally
    setPreview(initialUrl || '');
  }, [initialUrl]);

  const onPick = () => fileRef.current?.click();

  const onChange = async (e) => {
    const file = e.target.files?.[0];

    // allow choosing the same file again later
    if (fileRef.current) fileRef.current.value = '';

    if (!file) return;
    if (file.size > maxMB * 1024 * 1024) {
      toast({ title: `Please choose an image under ${maxMB}MB`, status: 'warning' });
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);

    setBusy(true);
    try {
      // This will upload to storage AND update profiles.avatar_url.
      // The service now selects() after update to surface any server/RLS errors.
      const url = await uploadAvatar(file);
      setPreview(url);
      onUploaded?.(url);
      toast({ title: 'Avatar updated', status: 'success' });
    } catch (err) {
      // Show the server message if present (e.g., RLS or payload issues)
      const msg = err?.message || err?.error_description || 'Upload failed';
      toast({ title: msg, status: 'error' });
      console.error('Avatar upload error:', err);
    } finally {
      setBusy(false);
      URL.revokeObjectURL(localUrl);
    }
  };

  return (
    <VStack align="start" spacing={3}>
      <HStack spacing={4}>
        <Avatar size="xl" src={preview || undefined} />
        <VStack align="start" spacing={1}>
          <Button onClick={onPick} isDisabled={busy}>
            {busy ? <Spinner size="sm" mr={2} /> : null}
            {busy ? 'Uploading…' : 'Change photo'}
          </Button>
          <Text fontSize="xs" color="gray.500">
            PNG/JPG up to ~{maxMB}MB. Stored at <code>avatars/&lt;uid&gt;/…</code>
          </Text>
        </VStack>
      </HStack>
      <Input
        ref={fileRef}
        type="file"
        accept="image/*"
        display="none"
        onChange={onChange}
      />
    </VStack>
  );
}
