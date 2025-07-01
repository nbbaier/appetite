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

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a mock client if environment variables are not set
let supabase: SupabaseClient;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  // Mock Supabase client for development without environment variables
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
            message: "Please connect to Supabase first",
          } as AuthError,
        }) as Promise<AuthResponse>,
      signInWithPassword: () =>
        Promise.resolve({
          data: { user: null, session: null, weakPassword: null },
          error: {
            name: "AuthError",
            message: "Please connect to Supabase first",
          } as AuthError,
        }) as Promise<AuthTokenResponsePassword>,
      signOut: () => Promise.resolve({ error: null }),
    },
  } as unknown as SupabaseClient;
}

export { supabase };
