import type React from "react";
import { lazy, Suspense } from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import { Toaster } from "sonner";
import { AuthForm } from "./components/auth/AuthForm";
import { Layout } from "./components/layout/Layout";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { PantryProvider } from "./contexts/PantryContext";
import { RecipeProvider } from "./contexts/RecipeContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import LandingPage from "./pages/LandingPage";

// Add lazy imports for pages with correct default export
const Assistant = lazy(() =>
  import("./pages/Assistant").then((m) => ({ default: m.Assistant }))
);
const Dashboard = lazy(() =>
  import("./pages/Dashboard").then((m) => ({ default: m.Dashboard }))
);
const Leftovers = lazy(() =>
  import("./pages/Leftovers").then((m) => ({ default: m.Leftovers }))
);
const Pantry = lazy(() =>
  import("./pages/Pantry").then((m) => ({ default: m.Pantry }))
);
const Recipes = lazy(() =>
  import("./pages/Recipes").then((m) => ({ default: m.Recipes }))
);
const Settings = lazy(() =>
  import("./pages/Settings").then((m) => ({ default: m.Settings }))
);
const Shopping = lazy(() =>
  import("./pages/Shopping").then((m) => ({ default: m.Shopping }))
);
const Signup = lazy(() => import("./pages/Signup"));
const Signin = lazy(() => import("./pages/Signin"));

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isSupabaseConnected } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto size-8 animate-spin rounded-full border-primary border-b-2" />
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If Supabase is not connected, show auth form with setup message
  if (!(isSupabaseConnected && user)) {
    return <AuthForm />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { user, loading, isSupabaseConnected } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto size-8 animate-spin rounded-full border-primary border-b-2" />
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  return (
    <Routes>
      <Route
        element={
          user && isSupabaseConnected ? (
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          ) : (
            <LandingPage />
          )
        }
        path="/"
      />
      <Route element={<Signup />} path="/signup" />
      <Route element={<Signin />} path="/signin" />
      <Route
        element={
          <ProtectedRoute>
            <Layout>
              <Assistant />
            </Layout>
          </ProtectedRoute>
        }
        path="/assistant"
      />
      <Route
        element={
          <ProtectedRoute>
            <Layout>
              <Pantry />
            </Layout>
          </ProtectedRoute>
        }
        path="/pantry"
      />
      <Route
        element={
          <ProtectedRoute>
            <Layout>
              <Recipes />
            </Layout>
          </ProtectedRoute>
        }
        path="/recipes"
      />
      <Route
        element={
          <ProtectedRoute>
            <Layout>
              <Shopping />
            </Layout>
          </ProtectedRoute>
        }
        path="/shopping"
      />
      <Route
        element={
          <ProtectedRoute>
            <Layout>
              <Leftovers />
            </Layout>
          </ProtectedRoute>
        }
        path="/leftovers"
      />
      <Route
        element={
          <ProtectedRoute>
            <Layout>
              <Settings />
            </Layout>
          </ProtectedRoute>
        }
        path="/settings"
      />
      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  );
}

function App() {
  try {
    return (
      <AuthProvider>
        <SettingsProvider>
          <PantryProvider>
            <RecipeProvider>
              <NotificationProvider>
                <Router>
                  <Toaster position="top-right" richColors />
                  <Suspense
                    fallback={
                      <div className="flex min-h-dvh items-center justify-center bg-background">
                        <div className="text-center">
                          <div className="mx-auto size-8 animate-spin rounded-full border-primary border-b-2" />
                          <p className="mt-2 text-muted-foreground">
                            Loading...
                          </p>
                        </div>
                      </div>
                    }
                  >
                    <AppRoutes />
                  </Suspense>
                </Router>
              </NotificationProvider>
            </RecipeProvider>
          </PantryProvider>
        </SettingsProvider>
      </AuthProvider>
    );
  } catch (error) {
    console.error("App render error:", error);
    return (
      <div className="flex min-h-dvh items-center justify-center bg-red-50 p-4">
        <div className="text-center">
          <h1 className="mb-2 font-bold text-2xl text-red-600">
            Application Error
          </h1>
          <p className="text-red-500">
            Please check the browser console for details.
          </p>
        </div>
      </div>
    );
  }
}

export default App;
