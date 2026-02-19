import { cn } from "@/lib/utils";

export interface ListHeaderProps {
  name: string;
  description?: string;
  gamesCount: number;
  right?: React.ReactNode;
  className?: string;
}

export function ListHeader({
  name,
  description,
  gamesCount,
  right,
  className,
}: ListHeaderProps) {
  return (
    <header
      className={cn(
        "rounded-2xl border border-zinc-800 bg-zinc-900/20 p-6 shadow-sm",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <p className="text-xs font-medium tracking-wide text-zinc-500">Lista</p>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-50">
        {name}
      </h1>
      {description ? (
        <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-200">
          {description}
        </p>
      ) : null}
      <p className="mt-4 text-sm text-zinc-400">
        <span className="font-medium tabular-nums text-zinc-200">
          {gamesCount}
        </span>{" "}
        jogos
      </p>
    </header>
  );
}
