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
import { z } from "zod";
import { validateEnv } from "./validation";

// Define environment schema that makes Supabase vars optional in test mode
const createEnvSchema = (mode: string | undefined) => {
  const isTestMode = mode === "test";
  
  return z.object({
    VITE_SUPABASE_URL: isTestMode 
      ? z.string().optional()
      : z.string().url("Invalid Supabase URL. Please set VITE_SUPABASE_URL in your .env file."),
    VITE_SUPABASE_ANON_KEY: isTestMode
      ? z.string().optional()
      : z.string().min(1, "Supabase anon key is required. Please set VITE_SUPABASE_ANON_KEY in your .env file."),
    MODE: z.enum(["development", "production", "test"]).optional(),
  });
};

// Get MODE first to determine validation requirements
const mode = import.meta.env.MODE;

// Validate environment variables with appropriate schema
const env = validateEnv(createEnvSchema(mode), {
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  MODE: mode,
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

// Create Supabase client or mock for testing
let supabase: SupabaseClient;

if (mode === "test") {
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
            message: "Mock Supabase client - testing mode. Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY for real authentication.",
          } as AuthError,
        }) as Promise<AuthResponse>,
      signInWithPassword: () =>
        Promise.resolve({
          data: { user: null, session: null, weakPassword: null },
          error: {
            name: "AuthError",
            message: "Mock Supabase client - testing mode. Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY for real authentication.",
          } as AuthError,
        }) as Promise<AuthTokenResponsePassword>,
      signOut: () => Promise.resolve({ error: null }),
    },
  } as unknown as SupabaseClient;
} else if (!supabaseUrl || !supabaseAnonKey) {
  // Provide helpful error message if env vars are missing in development
  throw new Error(
    "Supabase configuration missing. Please create a .env file with:\n" +
    "VITE_SUPABASE_URL=your_supabase_url\n" +
    "VITE_SUPABASE_ANON_KEY=your_supabase_anon_key\n\n" +
    "See the README for setup instructions."
  );
} else {
  // Create real Supabase client (env vars are validated above)
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };
