import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ChefHat, Sparkles } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useAuth } from "../../contexts/AuthContext";
import { handleApiError } from "../../lib/errorUtils";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signUpSchema = signInSchema
  .extend({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignUpFormData = z.infer<typeof signUpSchema>;

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
          data.fullName,
        );
        if (error) throw error;
        navigate("/");
      } else {
        const { error } = await signIn(data.email, data.password);
        if (error) throw error;
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

  return (
    <div className="flex justify-center items-center p-4 min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100">
      <Card className="w-full max-w-md border-emerald-100 shadow-2xl">
        <CardHeader className="pb-8 text-center">
          <div className="relative mx-auto mb-6">
            <div className="flex justify-center items-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-xl">
              <ChefHat className="w-8 h-8 text-white" />
              <Sparkles className="absolute -top-2 -right-2 w-5 h-5 text-yellow-300 animate-pulse" />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-emerald-700">
              {isSignUp ? "Join Appetite" : "Welcome Back"}
            </CardTitle>
            <CardDescription className="text-base">
              {isSignUp
                ? "Start your AI-powered cooking journey today"
                : "Your intelligent cooking companion awaits"}
            </CardDescription>
            <div className="flex justify-center items-center pt-2 space-x-2">
              <span className="px-2 py-1 text-xs font-medium text-emerald-700 bg-emerald-100 rounded-full">
                Beta
              </span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">AI-Powered</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!isSupabaseConnected && (
            <div className="p-4 mb-6 bg-amber-50 rounded-lg border border-amber-200 dark:bg-amber-950 dark:border-amber-800">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    Setup Required
                  </h4>
                  <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                    Click "Connect to Supabase" in the top right to set up
                    authentication and database.
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {isSignUp && (
              <Input
                disabled={loading}
                {...register("fullName")}
                name="fullName"
                min={2}
                label="Full Name"
              />
            )}
            <Input
              disabled={loading}
              onChange={register("email").onChange}
              onBlur={register("email").onBlur}
              ref={register("email").ref}
              name="email"
              type="email"
              label="Email"
            />
            <Input
              disabled={loading}
              onChange={register("password").onChange}
              onBlur={register("password").onBlur}
              ref={register("password").ref}
              name="password"
              type="password"
              label="Password"
            />
            {isSignUp && (
              <Input
                disabled={loading}
                onChange={register("confirmPassword").onChange}
                onBlur={register("confirmPassword").onBlur}
                ref={register("confirmPassword").ref}
                name="confirmPassword"
                type="password"
                label="Confirm Password"
              />
            )}

            {error && (
              <div className="p-3 text-sm rounded-lg bg-destructive/15 text-destructive">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
              disabled={loading || !isSupabaseConnected}
            >
              {loading ? "Loading..." : isSignUp ? "Create Account" : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-sm font-medium text-emerald-600 hover:text-emerald-700 disabled:opacity-50"
              disabled={loading}
            >
              {isSignUp
                ? "Already have an account? Sign in"
                : "Don't have an account? Sign up"}
            </button>
          </div>

          {!isSupabaseConnected && (
            <div className="mt-6 text-center">
              <p className="text-xs text-muted-foreground">
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
