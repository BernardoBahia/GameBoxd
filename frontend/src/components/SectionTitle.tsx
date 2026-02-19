import * as React from "react";

import { cn } from "@/lib/utils";

type HeadingTag = "h1" | "h2" | "h3";

export interface SectionTitleProps {
  title: string;
  description?: string;
  className?: string;
  right?: React.ReactNode;
  as?: HeadingTag;
}

export function SectionTitle({
  title,
  description,
  className,
  right,
  as: As = "h2",
}: SectionTitleProps) {
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="space-y-2">
        <As className="text-2xl font-semibold tracking-tight">{title}</As>
        {description ? (
          <p className="max-w-2xl text-sm leading-6 text-zinc-400">
            {description}
          </p>
        ) : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}
