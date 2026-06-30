import React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: "none" | "primary" | "accent";
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  className,
  children,
  glow = "none",
  hoverable = false,
  ...props
}) => {
  return (
    <div
      className={cn(
        "glass-panel rounded-2xl p-6 transition-all duration-300 relative overflow-hidden",
        hoverable && "glass-panel-hover cursor-pointer",
        glow === "primary" && "neon-glow-primary border-primary/20",
        glow === "accent" && "neon-glow-accent border-accent/20",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
