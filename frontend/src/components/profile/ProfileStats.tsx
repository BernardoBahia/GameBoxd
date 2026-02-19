import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface ProfileStatsProps {
  className?: string;
  stats: Array<{
    label: string;
    value: string;
  }>;
}

export function ProfileStats({ stats, className }: ProfileStatsProps) {
  return (
    <div className={cn("grid gap-3 sm:grid-cols-3", className)}>
      {stats.map((stat) => (
        <Card key={stat.label} className="border-zinc-800">
          <CardContent className="p-4">
            <p className="text-xs font-medium tracking-wide text-zinc-500">
              {stat.label}
            </p>
            <p className="mt-2 text-lg font-semibold tabular-nums text-zinc-50">
              {stat.value}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
