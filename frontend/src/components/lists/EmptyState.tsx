import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  title: string;
  description?: string;
  className?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  actionDisabled?: boolean;
}

export function EmptyState({
  title,
  description,
  className,
  actionLabel = "Criar lista",
  actionHref,
  onAction,
  actionDisabled,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/20 p-8 text-center",
        className
      )}
    >
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-800/60">
        <div className="h-6 w-6 rounded-md bg-zinc-900/40" />
      </div>
      <h2 className="mt-4 text-base font-semibold tracking-tight text-zinc-50">
        {title}
      </h2>
      {description ? (
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-400">
          {description}
        </p>
      ) : null}
      <div className="mt-6 flex justify-center">
        {actionHref ? (
          <Button asChild variant="outline">
            <Link href={actionHref}>{actionLabel}</Link>
          </Button>
        ) : (
          <Button
            variant="outline"
            type="button"
            onClick={onAction}
            disabled={actionDisabled}
          >
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
