import * as React from "react";

import { cn } from "@/lib/utils";

export interface AuthCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function AuthCard({
  title,
  description,
  children,
  className,
}: AuthCardProps) {
  return (
    <section
      className={cn(
        "w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 shadow-sm",
        className
      )}
    >
      <header className="space-y-2">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-50">
          {title}
        </h1>
        {description ? (
          <p className="text-sm leading-6 text-zinc-400">{description}</p>
        ) : null}
      </header>
      <div className="mt-6">{children}</div>
    </section>
  );
}
