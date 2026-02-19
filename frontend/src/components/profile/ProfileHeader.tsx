import { cn } from "@/lib/utils";

export interface ProfileHeaderProps {
  name: string;
  handle: string;
  bio?: string;
  className?: string;
}

export function ProfileHeader({
  name,
  handle,
  bio,
  className,
}: ProfileHeaderProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-zinc-800 bg-zinc-900/20 p-6 shadow-sm",
        className
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-2xl bg-zinc-800/70" />
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold tracking-tight">
              {name}
            </h1>
            <p className="mt-1 text-sm text-zinc-400">{handle}</p>
            {bio ? (
              <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-200">
                {bio}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="h-9 w-24 rounded-md border border-zinc-800 bg-zinc-900/30" />
          <div className="h-9 w-28 rounded-md border border-zinc-800 bg-zinc-900/30" />
        </div>
      </div>
    </section>
  );
}
