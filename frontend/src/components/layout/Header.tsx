"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Mic, Activity } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const Header: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();

  // Simple Breadcrumbs Mapper
  const getPageTitle = () => {
    switch (pathname) {
      case "/dashboard":
        return "Dashboard";
      case "/voice":
        return "Voice Journaling";
      case "/history":
        return "Reflection Logs";
      case "/insights":
        return "Cognitive Analytics";
      case "/settings":
        return "Profile & Customizations";
      default:
        return "CogniMirror";
    }
  };

  return (
    <header className="h-16 border-b border-white/5 bg-[#09090B]/60 backdrop-blur-md flex items-center justify-between px-8 select-none z-20 sticky top-0">
      {/* Page Breadcrumb */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">
          Portal
        </span>
        <span className="text-zinc-600 text-sm font-light">/</span>
        <span className="text-sm font-semibold text-[#FAFAFA] tracking-wide">
          {getPageTitle()}
        </span>
      </div>

      {/* Action shortcuts */}
      <div className="flex items-center gap-4">
        {/* Core System Status */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/3 border border-white/5">
          <Activity size={12} className="text-accent animate-pulse" />
          <span className="text-[10px] text-zinc-400 font-semibold tracking-wide uppercase">
            AI Engine Online
          </span>
        </div>

        {/* Quick Voice Record button (Only show if not on voice recording page) */}
        {pathname !== "/voice" && (
          <Button
            variant="accent"
            size="sm"
            onClick={() => router.push("/voice")}
            className="flex items-center gap-2"
          >
            <Mic size={14} />
            <span className="text-xs">Quick Record</span>
          </Button>
        )}

        {/* Notification Bell mock */}
        <button className="p-2.5 rounded-xl bg-white/3 border border-white/5 hover:bg-white/5 hover:border-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer relative">
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
        </button>
      </div>
    </header>
  );
};
