// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Center, Spinner } from '@chakra-ui/react';
import { useAuth } from '../lib/auth';

export default function ProtectedRoute() {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Center minH="60vh">
        <Spinner size="lg" />
      </Center>
    );
  }

  // No session -> force user to Signup (they can switch to Login there)
  if (!session) {
    return <Navigate to="/signup" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
