// netlify/functions/remove-subscription.js
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export const handler = async (event) => {
  try {
    const { endpoint } = JSON.parse(event.body || '{}');
    if (!endpoint) return { statusCode: 400, body: 'Missing endpoint' };
    await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint);
    return { statusCode: 200, body: 'OK' };
  } catch (e) {
    return { statusCode: 500, body: 'Error' };
  }
};
