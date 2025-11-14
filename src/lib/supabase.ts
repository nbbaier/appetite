import {
  AuthChangeEvent,
  AuthError,
  AuthResponse,
  AuthTokenResponsePassword,
  createClient,
  Session,
  Subscription,
  SupabaseClient,
} from "@supabase/supabase-js";
import { envSchema, validateEnv } from "./validation";

// Validate environment variables at startup
const env = validateEnv(envSchema, {
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  MODE: import.meta.env.MODE,
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

// Create Supabase client or mock for testing
let supabase: SupabaseClient;

if (import.meta.env.MODE === "test") {
  // Mock Supabase client for testing only
  const mockSubscription: Subscription = {
    id: "mock-subscription",
    callback: () => {
      void 0;
    },
    unsubscribe: () => {
      void 0;
    },
  };

  supabase = {
    auth: {
      getSession: () =>
        Promise.resolve({
          data: { session: null, user: null },
          error: null,
        }) as Promise<AuthResponse>,
      onAuthStateChange: (
        callback: (
          event: AuthChangeEvent,
          session: Session | null,
        ) => void | Promise<void>,
      ) => {
        // Call callback immediately with no session
        callback("SIGNED_OUT", null);
        return { data: { subscription: mockSubscription } };
      },
      signUp: () =>
        Promise.resolve({
          data: { user: null, session: null },
          error: {
            name: "AuthError",
            message: "Mock client - testing mode",
          } as AuthError,
        }) as Promise<AuthResponse>,
      signInWithPassword: () =>
        Promise.resolve({
          data: { user: null, session: null, weakPassword: null },
          error: {
            name: "AuthError",
            message: "Mock client - testing mode",
          } as AuthError,
        }) as Promise<AuthTokenResponsePassword>,
      signOut: () => Promise.resolve({ error: null }),
    },
  } as unknown as SupabaseClient;
} else {
  // Create real Supabase client (env vars are validated above)
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };
