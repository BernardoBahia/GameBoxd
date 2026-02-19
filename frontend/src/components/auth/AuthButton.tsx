import * as React from "react";

import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type AuthButtonVariant = "primary" | "secondary";

export interface AuthButtonProps extends Omit<ButtonProps, "variant"> {
  variant?: AuthButtonVariant;
}

export function AuthButton({
  className,
  variant = "primary",
  ...props
}: AuthButtonProps) {
  return (
    <Button
      className={cn("w-full", className)}
      variant={variant === "primary" ? "default" : "outline"}
      {...props}
    />
  );
}
