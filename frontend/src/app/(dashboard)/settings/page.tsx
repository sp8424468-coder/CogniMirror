"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { User, Shield, CheckCircle, AlertCircle } from "lucide-react";

const profileSchema = z.object({
  full_name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().optional().or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function SettingsPage() {
  const { user, token, updateUser } = useAuth();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: user?.full_name || "",
      email: user?.email || "",
      password: "",
    },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    setIsSubmitting(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      const payload: { full_name: string; email: string; password?: string } = {
        full_name: data.full_name,
        email: data.email,
      };
      if (data.password) {
        payload.password = data.password;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/profile/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to update profile settings.");
      }

      const resData = await response.json();
      updateUser(resData);
      setSuccessMsg("Account profile successfully synchronized!");
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 select-none">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Profile & Customizations</h1>
        <p className="text-zinc-400 text-sm font-light mt-1">
          Manage your cognitive companion settings, credential linkages, and preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side Settings Form */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <User size={16} className="text-zinc-500" />
              <span className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">
                Personal credentials
              </span>
            </div>

            {successMsg && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-2">
                <CheckCircle size={14} />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium flex items-center gap-2">
                <AlertCircle size={14} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <Input
                label="Full Name"
                placeholder="Alexander Mercer"
                error={errors.full_name?.message}
                {...register("full_name")}
              />
              <Input
                label="Email Address"
                placeholder="alexander@company.com"
                error={errors.email?.message}
                {...register("email")}
              />
              <Input
                type="password"
                label="New Password (optional)"
                placeholder="Leave blank to keep current password"
                error={errors.password?.message}
                {...register("password")}
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full mt-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save Preferences"}
              </Button>
            </form>
          </Card>
        </div>

        {/* Right Side Security Status */}
        <div className="flex flex-col gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield size={16} className="text-zinc-500" />
              <span className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">
                Linked Accounts
              </span>
            </div>

            <div className="flex flex-col gap-3">
              <div className="p-3.5 rounded-xl border border-white/5 bg-white/2 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white">Google SSO</span>
                  <span className="text-[10px] text-zinc-500 mt-0.5">
                    {user?.provider === "google" ? "Linked profile" : "Not linked"}
                  </span>
                </div>
                {user?.provider === "google" ? (
                  <span className="px-2 py-0.5 rounded-sm bg-accent/20 text-[9px] font-semibold text-accent uppercase">
                    Connected
                  </span>
                ) : (
                  <button className="text-[10px] font-bold text-primary hover:text-primary/80 transition-colors cursor-pointer">
                    Link
                  </button>
                )}
              </div>

              <div className="p-3.5 rounded-xl border border-white/5 bg-white/2 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white">Email Address</span>
                  <span className="text-[10px] text-zinc-500 mt-0.5">Primary email validation</span>
                </div>
                <span className="px-2 py-0.5 rounded-sm bg-emerald-500/20 text-[9px] font-semibold text-emerald-400 uppercase">
                  Verified
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
