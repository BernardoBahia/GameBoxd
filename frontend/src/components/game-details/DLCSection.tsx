"use client";

import { useMemo, useState } from "react";

import { DLCCard } from "@/components/game-details/DLCCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { GameDlc } from "@/types/games";

export interface DLCSectionProps {
  dlcs?: GameDlc[] | null;
  showEmptyState?: boolean;
  className?: string;
}

export function DLCSection({
  dlcs,
  showEmptyState = false,
  className,
}: DLCSectionProps) {
  const items = dlcs && dlcs.length > 0 ? dlcs : null;
  const [expanded, setExpanded] = useState(false);

  const limit = 5;
  const visibleItems = useMemo(() => {
    if (!items) return [];
    return expanded ? items : items.slice(0, limit);
  }, [items, expanded]);

  if (!items) {
    if (!showEmptyState) return null;
    return (
      <Card className={cn("border-zinc-800 bg-zinc-900/20", className)}>
        <CardContent className="p-5">
          <div className="space-y-1">
            <h2 className="text-base font-semibold tracking-tight">DLCs</h2>
            <p className="text-sm text-zinc-400">Este jogo não possui DLCs.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-zinc-800 bg-zinc-900/20", className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-base font-semibold tracking-tight">DLCs</h2>
            <p className="text-sm text-zinc-400">
              Conteúdos adicionais em cards compactos.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 min-w-0 max-w-full">
          {visibleItems.map((dlc) => (
            <DLCCard key={dlc.id} name={dlc.name} type="Included" />
          ))}

          {items && items.length > limit ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded
                ? "Mostrar menos"
                : `Mostrar mais (${items.length - limit})`}
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
