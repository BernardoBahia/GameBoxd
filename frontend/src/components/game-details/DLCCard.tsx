import { DLCBadge, type DLCType } from "@/components/game-details/DLCBadge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface DLCCardProps {
  name: string;
  type: DLCType;
  className?: string;
}

export function DLCCard({ name, type, className }: DLCCardProps) {
  return (
    <Card
      className={cn(
        "w-full min-w-0 group border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/50 hover:border-zinc-700 transition-colors",
        className
      )}
    >
      <CardContent className="p-3 overflow-hidden">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 shrink-0 rounded-lg bg-zinc-800/60 transition-colors group-hover:bg-zinc-800" />
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-start justify-between gap-2">
              <p
                className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-100"
                title={name}
              >
                {name}
              </p>
              <DLCBadge type={type} className="shrink-0" />
            </div>
            <p className="mt-1 text-xs leading-5 text-zinc-500">
              Conteúdo extra
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
