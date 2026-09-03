"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  className?: string;
}

export function Button({ children, onClick, variant = "primary", className }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        variant === "primary" ? "btn-primary" : "btn-secondary",
        className
      )}
    >
      {children}
    </button>
  );
}