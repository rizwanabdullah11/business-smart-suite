"use client";

import { cn } from "@/lib/utils";

interface LoginCardProps {
  children: React.ReactNode;
  className?: string;
}

export function LoginCard({ children, className }: LoginCardProps) {
  return (
    <div
      className={cn(
        "relative w-full max-w-md overflow-hidden rounded-2xl border border-[#e9ecef] bg-white/95 p-8 shadow-[var(--login-card-shadow)] backdrop-blur-sm",
        "transition-all duration-300 hover:shadow-[var(--login-card-shadow-hover)] hover:border-[#dee2e6]",
        "opacity-0 animate-fade-in-up",
        className
      )}
      style={{ animationDelay: "0.1s" }}
    >
      {/* Accent bar */}
      {/* <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-[#c92a2a] to-[#e03131]" aria-hidden /> */}
      <div className="relative">{children}</div>
    </div>
  );
}
