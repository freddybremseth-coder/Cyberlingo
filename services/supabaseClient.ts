import { createClient } from '@supabase/supabase-js';

const REALTYFLOW_SUPABASE_URL =
  import.meta.env.VITE_REALTYFLOW_SUPABASE_URL || 'https://ereapsfcsqtdmzosgnnn.supabase.co';

const REALTYFLOW_SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_REALTYFLOW_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_KTywNu5kx3HfcOLInKOUjA_5Py79jZm';

export const supabase = createClient(
  REALTYFLOW_SUPABASE_URL,
  REALTYFLOW_SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'chatgenius-spanish-auth',
    },
  },
);
