import { test as base, expect as baseExpect } from '@playwright/test';

export const test = base.extend({
  role: ['guest', { option: true }],

  loginAs: async ({ page }, use) => {
    const doLogin = async (role) => {
      if (!role || role === 'guest') return;

      const email = process.env[`E2E_SUPABASE_EMAIL_${String(role).toUpperCase()}`];
      const pass  = process.env[`E2E_SUPABASE_PASS_${String(role).toUpperCase()}`];
      if (!email || !pass) {
        throw new Error(
          `Missing env creds for role "${role}". Set E2E_SUPABASE_EMAIL_${String(role).toUpperCase()} and E2E_SUPABASE_PASS_${String(role).toUpperCase()}`
        );
      }

      await page.goto('/login');
      // Your Chakra labels are literally "Email" and "Password"
      await page.getByLabel(/^email$/i).fill(email);
      await page.getByLabel(/^password$/i).fill(pass);
      await page.getByRole('button', { name: /^log in$/i }).click();

      // You navigate('/account') after success
      await page.waitForURL('**/account');
    };
    await use(doLogin);
  },
});

export const expect = baseExpect;
