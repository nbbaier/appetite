import { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    fullName: string,
  ) => Promise<{ error: import("@supabase/supabase-js").AuthError | null }>;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: import("@supabase/supabase-js").AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (
    email: string,
  ) => Promise<{ error: import("@supabase/supabase-js").AuthError | null }>;
  isSupabaseConnected: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({
  children,
  isSupabaseConnectedOverride,
}: {
  children: React.ReactNode;
  isSupabaseConnectedOverride?: boolean;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Allow override for testability
  const isSupabaseConnected =
    typeof isSupabaseConnectedOverride === "boolean"
      ? isSupabaseConnectedOverride
      : !!(
          import.meta.env.VITE_SUPABASE_URL &&
          import.meta.env.VITE_SUPABASE_ANON_KEY
        );

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        // Get initial session
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (mounted) {
          if (error) {
            console.warn("Supabase session error:", error);
          }
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      } catch (error) {
        if (mounted) {
          console.warn("Supabase connection error:", error);
          setLoading(false);
        }
      }
    };

    initAuth();

    // Listen for auth changes
    let subscription:
      | ReturnType<typeof supabase.auth.onAuthStateChange>
      | undefined;
    try {
      const {
        data: { subscription: authSubscription },
      } = supabase.auth.onAuthStateChange(
        (_event: AuthChangeEvent, session: Session | null) => {
          if (mounted) {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
          }
        },
      );
      // @ts-expect-error: test mock may not match Supabase Subscription type
      subscription = authSubscription;
    } catch (error) {
      console.warn("Auth state change listener error:", error);
      if (mounted) {
        setLoading(false);
      }
    }

    return () => {
      mounted = false;
      if (subscription) {
        // @ts-expect-error: test mock may not match Supabase Subscription type
        subscription.unsubscribe();
      }
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    if (!isSupabaseConnected) {
      return {
        error: {
          message: "Please connect to Supabase to create an account",
        } as import("@supabase/supabase-js").AuthError,
      };
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      return {
        error: error as import("@supabase/supabase-js").AuthError | null,
      };
    } catch (error) {
      return { error: error as import("@supabase/supabase-js").AuthError };
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConnected) {
      return {
        error: {
          message: "Please connect to Supabase to sign in",
        } as import("@supabase/supabase-js").AuthError,
      };
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return {
        error: error as import("@supabase/supabase-js").AuthError | null,
      };
    } catch (error) {
      return { error: error as import("@supabase/supabase-js").AuthError };
    }
  };

  const signOut = async () => {
    if (isSupabaseConnected) {
      try {
        await supabase.auth.signOut();
      } catch (error) {
        console.warn("Sign out error:", error);
      }
    }
  };

  const resetPassword = async (email: string) => {
    if (!isSupabaseConnected) {
      return {
        error: {
          message: "Please connect to Supabase to reset password",
        } as import("@supabase/supabase-js").AuthError,
      };
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      return {
        error: error as import("@supabase/supabase-js").AuthError | null,
      };
    } catch (error) {
      return { error: error as import("@supabase/supabase-js").AuthError };
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    isSupabaseConnected,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
