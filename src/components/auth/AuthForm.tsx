import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ChefHat } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useAuth } from "../../contexts/AuthContext";
import { handleApiError } from "../../lib/errorUtils";
import { type SignUpFormData, signUpSchema } from "../../lib/validation";

// Local signInSchema uses minimal password validation (6 chars minimum) to allow
// existing users with legacy passwords to sign in, even if their passwords do not
// meet current complexity requirements. Stricter password requirements are enforced
// only at sign-up (see signUpSchema in validation/schemas.ts).
const signInSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";

interface AuthFormProps {
  initialMode?: "signup" | "signin";
}

function AuthFormRaw({ initialMode }: AuthFormProps) {
  const [isSignUp, setIsSignUp] = useState(initialMode === "signup");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn, signUp, isSupabaseConnected } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, reset } = useForm<SignUpFormData>({
    resolver: zodResolver(isSignUp ? signUpSchema : signInSchema),
  });

  const onSubmit = async (data: SignUpFormData) => {
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await signUp(
          data.email,
          data.password,
          data.fullName
        );
        if (error) {
          throw error;
        }
        navigate("/");
      } else {
        const { error } = await signIn(data.email, data.password);
        if (error) {
          throw error;
        }
        navigate("/");
      }
    } catch (err: unknown) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError(null);
    reset();
  };

  let submitLabel = "Sign In";
  if (loading) {
    submitLabel = "Loading...";
  } else if (isSignUp) {
    submitLabel = "Create Account";
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-emerald-50 p-4 pb-[env(safe-area-inset-bottom)]">
      <Card className="w-full max-w-md border-emerald-100 shadow-2xl">
        <CardHeader className="pb-8 text-center">
          <div className="mx-auto mb-6">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-emerald-600 shadow-xl">
              <ChefHat className="size-8 text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-balance font-bold text-2xl text-emerald-700">
              {isSignUp ? "Join Appetite" : "Welcome Back"}
            </CardTitle>
            <CardDescription className="text-pretty text-base">
              {isSignUp
                ? "Start your AI-powered cooking journey today"
                : "Your intelligent cooking companion awaits"}
            </CardDescription>
            <div className="flex items-center justify-center space-x-2 pt-2">
              <span className="rounded-full bg-emerald-100 px-2 py-1 font-medium text-emerald-700 text-xs">
                Beta
              </span>
              <span className="text-muted-foreground text-xs">•</span>
              <span className="text-muted-foreground text-xs">AI-Powered</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!isSupabaseConnected && (
            <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
              <div className="flex items-start space-x-3">
                <AlertCircle className="mt-0.5 size-5 flex-shrink-0 text-amber-600" />
                <div>
                  <h4 className="font-medium text-amber-800 text-sm dark:text-amber-200">
                    Setup Required
                  </h4>
                  <p className="mt-1 text-amber-700 text-sm dark:text-amber-300">
                    Click "Connect to Supabase" in the top right to set up
                    authentication and database.
                  </p>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            {isSignUp && (
              <Input
                disabled={loading}
                {...register("fullName")}
                label="Full Name"
                min={2}
                name="fullName"
              />
            )}
            <Input
              disabled={loading}
              label="Email"
              name="email"
              onBlur={register("email").onBlur}
              onChange={register("email").onChange}
              ref={register("email").ref}
              type="email"
            />
            <Input
              disabled={loading}
              label="Password"
              name="password"
              onBlur={register("password").onBlur}
              onChange={register("password").onChange}
              ref={register("password").ref}
              type="password"
            />
            {isSignUp && (
              <Input
                disabled={loading}
                label="Confirm Password"
                name="confirmPassword"
                onBlur={register("confirmPassword").onBlur}
                onChange={register("confirmPassword").onChange}
                ref={register("confirmPassword").ref}
                type="password"
              />
            )}

            {error && (
              <div className="rounded-lg bg-destructive/15 p-3 text-destructive text-sm">
                {error}
              </div>
            )}

            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              disabled={loading || !isSupabaseConnected}
              type="submit"
            >
              {submitLabel}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              className="font-medium text-emerald-600 text-sm hover:text-emerald-700 disabled:opacity-50"
              disabled={loading}
              onClick={toggleMode}
              type="button"
            >
              {isSignUp
                ? "Already have an account? Sign in"
                : "Don't have an account? Sign up"}
            </button>
          </div>

          {!isSupabaseConnected && (
            <div className="mt-6 text-center">
              <p className="text-muted-foreground text-xs">
                Demo mode - Connect Supabase for full functionality
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export const AuthForm = React.memo(AuthFormRaw);
