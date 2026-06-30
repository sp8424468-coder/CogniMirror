"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { motion } from "framer-motion";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      // Direct call to FastAPI backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Authentication failed. Incorrect email or password.");
      }

      const resData = await response.json();
      
      // Fetch user profile info
      const meResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/auth/me`, {
        headers: { Authorization: `Bearer ${resData.access_token}` },
      });
      
      let userData = undefined;
      if (meResponse.ok) {
        userData = await meResponse.json();
      }
      
      login(resData.access_token, userData);
    } catch (err: any) {
      setErrorMsg(err.message || "Authentication failed. Please check your network and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credential: "google_mock_credential",
          email: "alexander@cognimirror.ai",
          full_name: "Alexander Mercer",
        }),
      });

      if (!response.ok) {
        throw new Error("Google login failed");
      }

      const resData = await response.json();
      login(resData.access_token, {
        id: "usr_google123",
        email: "alexander@cognimirror.ai",
        full_name: "Alexander Mercer",
        provider: "google",
        created_at: new Date().toISOString(),
      });
    } catch (err: any) {
      setErrorMsg(err.message || "Google authentication failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-[#09090B] px-6 select-none relative grid-bg">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        {/* Brand Link */}
        <Link href="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-accent flex items-center justify-center neon-glow-primary">
            <span className="text-sm font-black text-white">CM</span>
          </div>
          <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            CogniMirror
          </span>
        </Link>

        <Card className="p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold tracking-tight text-white mb-2">
              Welcome Back
            </h2>
            <p className="text-zinc-400 text-xs font-light">
              Access your personalized cognitive workspace.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-[#22D3EE]/10 border border-[#22D3EE]/25 text-accent text-xs font-medium text-center">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input
              type="email"
              label="Email Address"
              placeholder="name@company.com"
              error={errors.email?.message}
              {...register("email")}
            />
            <div className="flex flex-col gap-1">
              <Input
                type="password"
                label="Password"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register("password")}
              />
              <Link
                href="/forgot-password"
                className="text-right text-[10px] text-zinc-500 hover:text-zinc-300 font-medium mt-1 transition-colors"
              >
                Forgot Password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing..." : "Sign In"}
            </Button>
          </form>

          {/* Separator */}
          <div className="relative my-6 select-none">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[#18181B] px-3 text-zinc-500 text-[10px] font-semibold tracking-wider uppercase">
                or continue with
              </span>
            </div>
          </div>

          {/* Google Login CTA */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-2.5 border-white/5 hover:bg-white/5"
            disabled={isSubmitting}
          >
            {/* Minimalist Google Icon */}
            <svg className="w-4 h-4 text-zinc-300" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span className="text-xs">Continue with Google</span>
          </Button>

          <p className="text-center text-xs text-zinc-500 font-light mt-6">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Sign up free
            </Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
