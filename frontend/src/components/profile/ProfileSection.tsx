import * as React from "react";

import { cn } from "@/lib/utils";

export interface ProfileSectionProps {
  title: string;
  description?: string;
  className?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}

export function ProfileSection({
  title,
  description,
  className,
  right,
  children,
}: ProfileSectionProps) {
  return (
    <section className={cn("space-y-4", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-base font-semibold tracking-tight">{title}</h2>
          {description ? (
            <p className="text-sm text-zinc-400">{description}</p>
          ) : null}
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
      {children}
    </section>
  );
}
