import * as React from "react";

import { cn } from "@/lib/utils";

export type BadgeVariant = "default" | "secondary" | "outline";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
}

const base =
  "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium";

const variants: Record<BadgeVariant, string> = {
  default: "bg-zinc-50 text-zinc-950",
  secondary: "bg-zinc-900 text-zinc-50",
  outline: "border border-zinc-700 text-zinc-100",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return <div className={cn(base, variants[variant], className)} {...props} />;
}
