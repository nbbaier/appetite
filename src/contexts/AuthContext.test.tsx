import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import { supabase } from "../lib/supabase";
import { AuthProvider, useAuth } from "./AuthContext";

// Mock supabase
vi.mock("../lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: vi
        .fn()
        .mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: {
          subscription: {
            unsubscribe: vi.fn(),
            data: { subscription: {} },
          },
        },
      }),
      signUp: vi.fn().mockResolvedValue({ error: null }),
      signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
      signOut: vi.fn().mockResolvedValue({}),
    },
  },
}));

// Helper to mock import.meta.env
function setViteEnv(vars: Record<string, string | undefined>) {
  Object.defineProperty(import.meta, "env", {
    value: vars,
    writable: true,
    configurable: true,
  });
}

function TestComponent() {
  const auth = useAuth();
  console.log(
    "TestComponent: loading =",
    auth.loading,
    "isSupabaseConnected =",
    auth.isSupabaseConnected,
  );
  return (
    <div>
      <span data-testid="loading">{String(auth.loading)}</span>
      <span data-testid="isSupabaseConnected">
        {String(auth.isSupabaseConnected)}
      </span>
    </div>
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setViteEnv({}); // Reset env for each test
  });

  it("throws error if useAuth is used outside provider", () => {
    // Suppress error output
    const spy = vi.spyOn(console, "error").mockImplementation(() => {
      // do nothing
    });
    function OutsideProvider() {
      useAuth();
      return null;
    }
    expect(() => render(<OutsideProvider />)).toThrow(
      "useAuth must be used within an AuthProvider",
    );
    spy.mockRestore();
  });

  it("provides default values and loading state", async () => {
    setViteEnv({
      VITE_SUPABASE_URL: undefined,
      VITE_SUPABASE_ANON_KEY: undefined,
    });
    console.log(
      "VITE_SUPABASE_URL:",
      import.meta.env.VITE_SUPABASE_URL,
      "VITE_SUPABASE_ANON_KEY:",
      import.meta.env.VITE_SUPABASE_ANON_KEY,
    );
    render(
      <AuthProvider isSupabaseConnectedOverride={false}>
        <TestComponent />
      </AuthProvider>,
    );
    // Should show loading false after effect
    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
    });
    expect(screen.getByTestId("isSupabaseConnected").textContent).toBe("false");
  });

  it("signUp returns error if not connected", async () => {
    setViteEnv({ VITE_SUPABASE_URL: "", VITE_SUPABASE_ANON_KEY: "" });
    console.log(
      "VITE_SUPABASE_URL:",
      import.meta.env.VITE_SUPABASE_URL,
      "VITE_SUPABASE_ANON_KEY:",
      import.meta.env.VITE_SUPABASE_ANON_KEY,
    );
    let result: { error: unknown } | undefined;
    function SignUpTest() {
      const auth = useAuth();
      React.useEffect(() => {
        auth.signUp("a@b.com", "pw", "Name").then((r) => {
          result = r;
          console.log(
            "SignUpTest: result =",
            result,
            "isSupabaseConnected =",
            auth.isSupabaseConnected,
          );
        });
      }, [auth.signUp, auth.isSupabaseConnected]);
      return null;
    }
    render(
      <AuthProvider isSupabaseConnectedOverride={false}>
        <SignUpTest />
      </AuthProvider>,
    );
    await waitFor(() => {
      expect(result?.error).toBeTruthy();
    });
  });

  it("signUp succeeds when connected", async () => {
    setViteEnv({ VITE_SUPABASE_URL: "url", VITE_SUPABASE_ANON_KEY: "key" });
    (supabase.auth.signUp as Mock).mockResolvedValueOnce({ error: null });
    let result: { error: unknown } | undefined;
    function SignUpTest() {
      const auth = useAuth();
      React.useEffect(() => {
        auth.signUp("a@b.com", "pw", "Name").then((r: { error: unknown }) => {
          result = r;
        });
      }, [auth.signUp]);
      return null;
    }
    render(
      <AuthProvider isSupabaseConnectedOverride={true}>
        <SignUpTest />
      </AuthProvider>,
    );
    await waitFor(() => {
      expect(result?.error).toBeFalsy();
    });
  });

  it("signUp returns error from Supabase", async () => {
    setViteEnv({ VITE_SUPABASE_URL: "url", VITE_SUPABASE_ANON_KEY: "key" });
    supabase.auth.signUp = vi
      .fn()
      .mockResolvedValueOnce({ error: { message: "fail" } });
    let result: { error: unknown } | undefined;
    function SignUpTest() {
      const auth = useAuth();
      React.useEffect(() => {
        auth.signUp("a@b.com", "pw", "Name").then((r: { error: unknown }) => {
          result = r;
        });
      }, [auth]);
      return null;
    }
    render(
      <AuthProvider isSupabaseConnectedOverride={true}>
        <SignUpTest />
      </AuthProvider>,
    );
    await waitFor(() => {
      console.log("signUp error test result:", result);
      expect(result?.error).toBeTruthy();
    });
  });

  it("signIn succeeds", async () => {
    setViteEnv({ VITE_SUPABASE_URL: "url", VITE_SUPABASE_ANON_KEY: "key" });
    (supabase.auth.signInWithPassword as Mock).mockResolvedValueOnce({
      error: null,
    });
    let result: { error: unknown } | undefined;
    function SignInTest() {
      const auth = useAuth();
      React.useEffect(() => {
        auth.signIn("a@b.com", "pw").then((r: { error: unknown }) => {
          result = r;
        });
      }, [auth.signIn]);
      return null;
    }
    render(
      <AuthProvider isSupabaseConnectedOverride={true}>
        <SignInTest />
      </AuthProvider>,
    );
    await waitFor(() => {
      expect(result?.error).toBeFalsy();
    });
  });

  it("signIn returns error from Supabase", async () => {
    setViteEnv({ VITE_SUPABASE_URL: "url", VITE_SUPABASE_ANON_KEY: "key" });
    supabase.auth.signInWithPassword = vi
      .fn()
      .mockResolvedValueOnce({ error: { message: "fail" } });
    let result: { error: unknown } | undefined;
    function SignInTest() {
      const auth = useAuth();
      React.useEffect(() => {
        auth.signIn("a@b.com", "pw").then((r: { error: unknown }) => {
          result = r;
        });
      }, [auth]);
      return null;
    }
    render(
      <AuthProvider isSupabaseConnectedOverride={true}>
        <SignInTest />
      </AuthProvider>,
    );
    await waitFor(() => {
      console.log("signIn error test result:", result);
      expect(result?.error).toBeTruthy();
    });
  });

  it("signOut succeeds", async () => {
    setViteEnv({ VITE_SUPABASE_URL: "url", VITE_SUPABASE_ANON_KEY: "key" });
    const signOutMock = vi.fn().mockResolvedValueOnce(undefined);
    supabase.auth.signOut = signOutMock;
    function SignOutTest() {
      const auth = useAuth();
      React.useEffect(() => {
        auth.signOut();
      }, [auth]);
      return null;
    }
    render(
      <AuthProvider isSupabaseConnectedOverride={true}>
        <SignOutTest />
      </AuthProvider>,
    );
    await waitFor(() => {
      expect(signOutMock).toHaveBeenCalled();
    });
  });

  it("signOut logs error if supabase throws", async () => {
    setViteEnv({ VITE_SUPABASE_URL: "url", VITE_SUPABASE_ANON_KEY: "key" });
    const error = new Error("fail");
    supabase.auth.signOut = vi.fn().mockRejectedValueOnce(error);
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {
      // do nothing
    });
    function SignOutTest() {
      const auth = useAuth();
      React.useEffect(() => {
        auth.signOut();
      }, [auth]);
      return null;
    }
    render(
      <AuthProvider isSupabaseConnectedOverride={true}>
        <SignOutTest />
      </AuthProvider>,
    );
    await waitFor(() => {
      expect(warnSpy).toHaveBeenCalledWith("Sign out error:", error);
    });
    warnSpy.mockRestore();
  });

  it("resetPassword succeeds", async () => {
    setViteEnv({ VITE_SUPABASE_URL: "url", VITE_SUPABASE_ANON_KEY: "key" });
    supabase.auth.resetPasswordForEmail = vi
      .fn()
      .mockResolvedValueOnce({ error: null });
    let result: { error: unknown } | undefined;
    function ResetTest() {
      const auth = useAuth();
      React.useEffect(() => {
        auth.resetPassword("a@b.com").then((r: { error: unknown }) => {
          result = r;
        });
      }, [auth]);
      return null;
    }
    render(
      <AuthProvider isSupabaseConnectedOverride={true}>
        <ResetTest />
      </AuthProvider>,
    );
    await waitFor(() => {
      expect(result?.error).toBeFalsy();
    });
  });

  it("resetPassword returns error from Supabase", async () => {
    setViteEnv({ VITE_SUPABASE_URL: "url", VITE_SUPABASE_ANON_KEY: "key" });
    supabase.auth.resetPasswordForEmail = vi
      .fn()
      .mockResolvedValueOnce({ error: { message: "fail" } });
    let result: { error: unknown } | undefined;
    function ResetTest() {
      const auth = useAuth();
      React.useEffect(() => {
        auth.resetPassword("a@b.com").then((r: { error: unknown }) => {
          result = r;
        });
      }, [auth]);
      return null;
    }
    render(
      <AuthProvider isSupabaseConnectedOverride={true}>
        <ResetTest />
      </AuthProvider>,
    );
    await waitFor(() => {
      expect(result?.error).toBeTruthy();
    });
  });
});
