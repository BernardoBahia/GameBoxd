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

          <div className="relative">
            <select
              value={selectedGenreId ?? ""}
              onChange={(e) => {
                const next = e.target.value;
                onGenreChange?.(next ? next : undefined);
              }}
              className={cn(
                "h-9 appearance-none rounded-md border border-zinc-700 bg-zinc-800 py-0 pl-3 pr-8 text-sm text-zinc-100 transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500",
                "hover:border-zinc-600 cursor-pointer",
              )}
              aria-label="Filtrar por gênero"
            >
              <option value="" className="bg-zinc-800 text-zinc-100">
                Gêneros (Todos)
              </option>
              {(genres ?? []).map((g) => (
                <option
                  key={g.id}
                  value={String(g.id)}
                  className="bg-zinc-800 text-zinc-100"
                >
                  {g.name}
                </option>
              ))}
            </select>
            {/* custom arrow */}
            <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-zinc-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
