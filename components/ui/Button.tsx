"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      fullWidth = false,
      type = "button",
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#8B4513] focus:ring-offset-2 disabled:opacity-50",
          variant === "primary" &&
            "bg-[#c92a2a] text-white shadow-md hover:bg-[#A0522D] hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow",
          variant === "secondary" &&
            "border border-[#dee2e6] bg-white text-[#343a40] hover:bg-[#f8f9fa] hover:border-[#ced4da]",
          variant === "ghost" && "bg-transparent text-[#343a40] hover:bg-[#f8f9fa]",
          fullWidth && "w-full",
          "py-3 px-5",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
