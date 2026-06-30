"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "accent" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, variant = "primary", size = "md", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 outline-hidden select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
      primary: "bg-primary text-[#FAFAFA] hover:bg-primary/90 border border-primary/20 neon-glow-primary",
      secondary: "bg-[#27272A] text-[#FAFAFA] hover:bg-[#3F3F46] border border-white/5",
      accent: "bg-[#09090B] text-accent hover:text-[#09090B] hover:bg-accent border border-accent/30 hover:shadow-[0_0_15px_rgba(34,211,238,0.4)]",
      outline: "bg-transparent text-[#FAFAFA] hover:bg-white/5 border border-white/10",
      ghost: "bg-transparent text-[#FAFAFA] hover:bg-white/5",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-5 py-2.5 text-sm",
      lg: "px-7 py-3.5 text-base",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, "active:scale-[0.98] transition-transform", variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
