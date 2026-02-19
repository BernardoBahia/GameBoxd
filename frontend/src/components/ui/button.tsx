import * as React from "react";

import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

export type ButtonVariant = "default" | "secondary" | "ghost" | "outline";
export type ButtonSize = "default" | "sm" | "lg" | "icon";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
}

const base =
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-200 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ring-offset-zinc-900 active:translate-y-px";

const variants: Record<ButtonVariant, string> = {
  default: "bg-zinc-50 text-zinc-950 hover:bg-zinc-200 active:bg-zinc-300",
  secondary: "bg-zinc-900 text-zinc-50 hover:bg-zinc-800 active:bg-zinc-700",
  ghost: "text-zinc-50 hover:bg-zinc-900 active:bg-zinc-800",
  outline:
    "border border-zinc-700 bg-transparent text-zinc-50 hover:bg-zinc-900/60 active:bg-zinc-900",
};

const sizes: Record<ButtonSize, string> = {
  default: "h-10 px-4",
  sm: "h-9 px-3",
  lg: "h-11 px-6",
  icon: "h-10 w-10",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "default", size = "default", asChild, ...props },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
