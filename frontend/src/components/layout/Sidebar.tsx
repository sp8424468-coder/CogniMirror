"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Mic,
  History,
  Sparkles,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Voice Recording", href: "/voice", icon: Mic },
    { name: "Journal History", href: "/history", icon: History },
    { name: "Cognitive Insights", href: "/insights", icon: Sparkles },
    { name: "Profile & Settings", href: "/settings", icon: Settings },
  ];

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 76 : 260 }}
      className="h-screen bg-[#0C0C0E]/90 border-r border-white/5 flex flex-col justify-between relative shrink-0 z-30"
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Collapse Trigger Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 w-6 h-6 rounded-full bg-[#18181B] border border-white/8 flex items-center justify-center cursor-pointer text-zinc-400 hover:text-white hover:border-white/20 transition-colors"
      >
        {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* Top Section - Brand Logo */}
      <div>
        <div className={cn("p-6 flex items-center gap-3 select-none", isCollapsed && "justify-center p-4")}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-accent flex items-center justify-center shrink-0 neon-glow-primary">
            <span className="text-sm font-black text-[#FAFAFA]">CM</span>
          </div>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-lg font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
            >
              CogniMirror
            </motion.span>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="px-3 py-4 flex flex-col gap-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3.5 px-3 py-3 rounded-xl cursor-pointer transition-all relative group select-none text-zinc-400 hover:text-white hover:bg-white/3",
                    isActive && "bg-white/5 text-[#FAFAFA]"
                  )}
                >
                  {/* Left Active Glow Indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="active-indicator"
                      className="absolute left-0 top-3 bottom-3 w-1 rounded-r-md bg-gradient-to-b from-primary to-accent"
                    />
                  )}

                  <Icon
                    size={18}
                    className={cn(
                      "transition-colors",
                      isActive ? "text-accent" : "text-zinc-400 group-hover:text-zinc-200"
                    )}
                  />

                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-sm font-medium"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section - User Profile info & Logout */}
      <div className="p-3 border-t border-white/5 flex flex-col gap-2">
        <div className={cn("flex items-center gap-3 px-3 py-2", isCollapsed && "justify-center p-1")}>
          <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 text-xs font-semibold text-accent border border-white/10 uppercase select-none">
            {user?.full_name ? user.full_name.substring(0, 2) : "ME"}
          </div>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col overflow-hidden text-left"
            >
              <span className="text-xs font-semibold text-zinc-200 truncate">
                {user?.full_name || ""}
              </span>
              <span className="text-[10px] text-zinc-500 truncate">
                {user?.email || ""}
              </span>
            </motion.div>
          )}
        </div>

        <button
          onClick={logout}
          className={cn(
            "w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors select-none",
            isCollapsed && "justify-center"
          )}
        >
          <LogOut size={16} />
          {!isCollapsed && <span className="text-xs font-medium">Log out</span>}
        </button>
      </div>
    </motion.aside>
  );
};
