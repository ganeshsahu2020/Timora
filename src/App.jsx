import { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useToast } from '@chakra-ui/react';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './layout/AppLayout';

// Core pages
import Dashboard from './pages/Dashboard';
import Habits from './pages/Habits';
import Wealth from './pages/Wealth';
import Sleep from './pages/Sleep';
import Insights from './pages/Insights';
import Settings from './pages/Settings';

// Habits suite
import AIHabitsCoach from './pages/AIHabitsCoach';
import HabitsWeeklyPlan from './pages/HabitsWeeklyPlan';

// Sleep suite
import AISleepCoach from './pages/AISleepCoach';
import SleepReport from './pages/SleepReport';
import SleepRecommendations from './pages/SleepRecommendations';

// Wealth suite
import AIFinancialAdvisor from './pages/AIFinancialAdvisor';
import WealthReport from './pages/WealthReport';
import WealthRecommendations from './pages/WealthRecommendations';

// Recovery suite
import Addiction from './pages/Addiction';
import AIAddictionCoach from './pages/AIAddictionCoach';
import RecoveryReport from './pages/RecoveryReport';
import RecoveryAdmin from './pages/RecoveryAdmin';

// Auth pages (public)
import Signup from './pages/auth/Signup';
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Personal
import Account from './pages/Account';

// Reminders (new)
import Reminders from './pages/Reminders';
import useReminderTicker from './hooks/useReminderTicker';

// Supabase
import { supabase } from './lib/supabase';

export default function App() {
  const navigate = useNavigate();
  const toast = useToast();

  // Start the global reminders ticker (toasts + notifications)
  useReminderTicker(toast);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user && ['/login', '/signup'].includes(window.location.pathname)) {
        navigate('/account', { replace: true });
      }
    });
    return () => sub?.subscription?.unsubscribe?.();
  }, [navigate]);

  return (
    <Routes>
      {/* Wrap ALL routes with AppLayout so header/main/footer are always present */}
      <Route element={<AppLayout />}>
        {/* ---------- Public (Auth) ---------- */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* ---------- Private under ProtectedRoute (still inside AppLayout) ---------- */}
        <Route element={<ProtectedRoute />}>
          {/* Home */}
          <Route path="/" element={<Dashboard />} />

          {/* Habits */}
          <Route path="/habits" element={<Habits />} />
          <Route path="/habits/coach" element={<AIHabitsCoach />} />
          <Route path="/habits/plan" element={<HabitsWeeklyPlan />} />

          {/* Wealth */}
          <Route path="/wealth" element={<Wealth />} />
          <Route path="/wealth/advisor" element={<AIFinancialAdvisor />} />
          <Route path="/wealth/report" element={<WealthReport />} />
          <Route path="/wealth/recommendations" element={<WealthRecommendations />} />

          {/* Sleep */}
          <Route path="/sleep" element={<Sleep />} />
          <Route path="/sleep/coach" element={<AISleepCoach />} />
          <Route path="/sleep/report" element={<SleepReport />} />
          <Route path="/sleep/recommendations" element={<SleepRecommendations />} />

          {/* Recovery */}
          <Route path="/recovery" element={<Addiction />} />
          <Route path="/recovery/coach" element={<AIAddictionCoach />} />
          <Route path="/recovery/report" element={<RecoveryReport />} />
          <Route path="/recovery/admin" element={<RecoveryAdmin />} />

          {/* Personal */}
          <Route path="/account" element={<Account />} />

          {/* Insights & Settings */}
          <Route path="/insights" element={<Insights />} />
          <Route path="/settings" element={<Settings />} />

          {/* Reminders (new shared page) */}
          <Route path="/reminders" element={<Reminders />} />
        </Route>

        {/* Fallback (inside layout so it still has landmarks) */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
