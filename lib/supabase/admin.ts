import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { serverEnv } from "@/lib/security/server-env";

/**
 * Service-role client. SERVER-ONLY. Used solely for:
 *  - account provisioning (creating Auth users),
 *  - password resets / deactivation (ban),
 *  - the private university-number → internal email lookup.
 * Never use for ordinary CRUD — those go through the admin session + RLS.
 */
export function createAdminClient() {
  return createSupabaseClient(
    serverEnv.NEXT_PUBLIC_SUPABASE_URL,
    serverEnv.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
