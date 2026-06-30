"use client";

import React, { useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#09090B] flex-col gap-4 select-none">
        {/* Sleek loading animation */}
        <div className="relative w-12 h-12 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin" />
          <div className="absolute inset-1.5 rounded-full border-b-2 border-accent animate-spin [animation-direction:reverse]" />
        </div>
        <span className="text-xs font-semibold text-zinc-500 tracking-wider uppercase animate-pulse">
          Aligning Mirrors...
        </span>
      </div>
    );
  }

  // Double column grid dashboard layout
  return (
    <div className="flex h-screen w-screen bg-[#09090B] overflow-hidden">
      {/* Collapsible Left Sidebar */}
      <Sidebar />

      {/* Main content frame */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative grid-bg">
        {/* Top Header Navbar */}
        <Header />

        {/* Viewport content */}
        <main className="flex-1 overflow-y-auto px-8 py-8 relative">
          {children}
        </main>
      </div>
    </div>
  );
}
