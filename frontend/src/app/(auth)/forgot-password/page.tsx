"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

const forgotSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = (data: ForgotFormValues) => {
    setIsSubmitting(true);
    setSuccessMsg(null);
    // Simulate reset request
    setTimeout(() => {
      setSuccessMsg(
        `Reset verification link has been dispatched to ${data.email}. Please check your inbox.`
      );
      setIsSubmitting(false);
    }, 1500);
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
              Recover Password
            </h2>
            <p className="text-zinc-400 text-xs font-light">
              Enter your email to receive recovery instructions.
            </p>
          </div>

          {successMsg && (
            <div className="mb-6 p-4 rounded-xl bg-accent/10 border border-accent/20 text-accent text-xs font-medium leading-relaxed">
              {successMsg}
            </div>
          )}

          {!successMsg && (
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <Input
                type="email"
                label="Email Address"
                placeholder="name@company.com"
                error={errors.email?.message}
                {...register("email")}
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full mt-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Dispatching..." : "Send Reset Link"}
              </Button>
            </form>
          )}

          <div className="text-center mt-6">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 font-medium transition-colors"
            >
              <ArrowLeft size={12} />
              <span>Return to login</span>
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
