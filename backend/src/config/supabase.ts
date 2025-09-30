import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AppEnv } from './env';
import { Database } from '../types/database';

export type SupabaseServiceClient = SupabaseClient<Database>;

export function createSupabaseClient(env: AppEnv): SupabaseServiceClient {
  return createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false
    }
  });
}
