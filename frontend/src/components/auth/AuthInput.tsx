import * as React from "react";

import { cn } from "@/lib/utils";

export interface AuthInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label: string;
  hint?: string;
}

export function AuthInput({
  label,
  hint,
  className,
  id,
  type = "text",
  ...props
}: AuthInputProps) {
  const fallbackId = React.useId();
  const inputId = id ?? fallbackId;

  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="text-sm font-medium text-zinc-200">
        {label}
      </label>
      <input
        id={inputId}
        type={type}
        className={cn(
          "h-11 w-full rounded-md border border-zinc-800 bg-zinc-900/40 px-3 text-sm text-zinc-50 placeholder:text-zinc-500 transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-200/20 focus-visible:border-zinc-700",
          className
        )}
        {...props}
      />
      {hint ? <p className="text-xs text-zinc-500">{hint}</p> : null}
    </div>
  );
}
