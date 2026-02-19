import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { GenreSummary } from "@/types/genres";

export interface FilterBarProps {
  title: string;
  searchValue?: string;
  onSearchValueChange?: (value: string) => void;
  onSearchSubmit?: () => void;
  onSearchClear?: () => void;
  genres?: GenreSummary[];
  selectedGenreId?: string;
  onGenreChange?: (slug: string | undefined) => void;
  selectedOrdering?: "top";
  onOrderingChange?: (ordering: "top") => void;
  className?: string;
}

export function FilterBar({
  title,
  searchValue,
  onSearchValueChange,
  onSearchSubmit,
  onSearchClear,
  genres,
  selectedGenreId,
  onGenreChange,
  selectedOrdering,
  onOrderingChange,
  className,
}: FilterBarProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-zinc-400">
          Pesquise pelo nome ou navegue pela lista.
        </p>
      </div>

      <div className="flex w-full flex-col gap-2 sm:w-auto sm:items-end">
        <div className="flex w-full items-center gap-2 sm:w-[420px]">
          <input
            value={searchValue ?? ""}
            onChange={(e) => onSearchValueChange?.(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSearchSubmit?.();
            }}
            placeholder="Pesquisar jogo pelo nome..."
            type="search"
            className={cn(
              "h-10 w-full rounded-md border border-zinc-800 bg-zinc-900/40 px-3 text-sm text-zinc-50 placeholder:text-zinc-500 transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-200/20 focus-visible:border-zinc-700"
            )}
          />

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onSearchClear?.()}
            disabled={!searchValue}
          >
            Limpar
          </Button>

          <Button type="button" size="sm" onClick={() => onSearchSubmit?.()}>
            Buscar
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium tracking-wide text-zinc-500">
            Ordenar
          </span>
          <Button
            variant={selectedOrdering === "top" ? "secondary" : "outline"}
            size="sm"
            onClick={() => onOrderingChange?.("top")}
          >
            Melhor nota
          </Button>

          <select
            value={selectedGenreId ?? ""}
            onChange={(e) => {
              const next = e.target.value;
              onGenreChange?.(next ? next : undefined);
            }}
            className={cn(
              "h-9 rounded-md border border-zinc-800 bg-zinc-900/40 px-3 text-sm text-zinc-50 transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-200/20 focus-visible:border-zinc-700"
            )}
            aria-label="Filtrar por gênero"
          >
            <option value="">Gêneros (Todos)</option>
            {(genres ?? []).map((g) => (
              <option key={g.id} value={String(g.id)}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
