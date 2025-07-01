import React, { lazy, Suspense } from "react";
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
  import("./pages/Assistant").then((m) => ({ default: m.Assistant })),
);
const Dashboard = lazy(() =>
  import("./pages/Dashboard").then((m) => ({ default: m.Dashboard })),
);
const Leftovers = lazy(() =>
  import("./pages/Leftovers").then((m) => ({ default: m.Leftovers })),
);
const Pantry = lazy(() =>
  import("./pages/Pantry").then((m) => ({ default: m.Pantry })),
);
const Recipes = lazy(() =>
  import("./pages/Recipes").then((m) => ({ default: m.Recipes })),
);
const Settings = lazy(() =>
  import("./pages/Settings").then((m) => ({ default: m.Settings })),
);
const Shopping = lazy(() =>
  import("./pages/Shopping").then((m) => ({ default: m.Shopping })),
);
const Signup = lazy(() => import("./pages/Signup"));
const Signin = lazy(() => import("./pages/Signin"));

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isSupabaseConnected } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <div className="text-center">
          <div className="mx-auto w-8 h-8 rounded-full border-b-2 animate-spin border-primary"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If Supabase is not connected, show auth form with setup message
  if (!isSupabaseConnected || !user) {
    return <AuthForm />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { user, loading, isSupabaseConnected } = useAuth();
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <div className="text-center">
          <div className="mx-auto w-8 h-8 rounded-full border-b-2 animate-spin border-primary"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  return (
    <Routes>
      <Route
        path="/"
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
      />
      <Route path="/signup" element={<Signup />} />
      <Route path="/signin" element={<Signin />} />
      <Route
        path="/assistant"
        element={
          <ProtectedRoute>
            <Layout>
              <Assistant />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/pantry"
        element={
          <ProtectedRoute>
            <Layout>
              <Pantry />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/recipes"
        element={
          <ProtectedRoute>
            <Layout>
              <Recipes />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/shopping"
        element={
          <ProtectedRoute>
            <Layout>
              <Shopping />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/leftovers"
        element={
          <ProtectedRoute>
            <Layout>
              <Leftovers />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Layout>
              <Settings />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
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
                      <div className="flex justify-center items-center min-h-screen bg-background">
                        <div className="text-center">
                          <div className="mx-auto w-8 h-8 rounded-full border-b-2 animate-spin border-primary"></div>
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
      <div className="flex justify-center items-center p-4 min-h-screen bg-red-50">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold text-red-600">
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
