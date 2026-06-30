import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, label, type = "text", ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-medium text-muted text-zinc-400 select-none">
            {label}
          </label>
        )}
        <input
          type={type}
          ref={ref}
          className={cn(
            "w-full bg-[#18181B]/80 text-[#FAFAFA] border border-white/8 rounded-xl px-4 py-2.5 text-sm transition-all placeholder:text-zinc-500 focus:outline-hidden focus:border-primary/50 focus:ring-1 focus:ring-primary/20",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
            className
          )}
          {...props}
        />
        {error && (
          <span className="text-xs text-red-500 font-medium select-none">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
