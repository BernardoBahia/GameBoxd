import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface PaginationProps {
  className?: string;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

function buildPageItems(page: number, totalPages: number) {
  if (totalPages <= 1) return [1];

  const items: Array<number | "ellipsis"> = [];

  const clampedPage = Math.min(totalPages, Math.max(1, page));
  items.push(1);

  const start = Math.max(2, clampedPage - 1);
  const end = Math.min(totalPages - 1, clampedPage + 1);

  if (start > 2) items.push("ellipsis");

  for (let p = start; p <= end; p += 1) items.push(p);

  if (end < totalPages - 1) items.push("ellipsis");

  if (totalPages > 1) items.push(totalPages);

  // Remove duplicates when page is near edges
  return items.filter((item, index) => items.indexOf(item) === index);
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  if (!page || !totalPages || !onPageChange) {
    return (
      <nav
        className={cn("flex items-center justify-between gap-3", className)}
        aria-label="Paginação"
      >
        <Button variant="outline" size="sm" disabled>
          Anterior
        </Button>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" aria-current="page">
            1
          </Button>
          <Button variant="outline" size="sm">
            2
          </Button>
          <Button variant="outline" size="sm">
            3
          </Button>
          <span className="px-1 text-sm text-zinc-500">…</span>
          <Button variant="outline" size="sm">
            12
          </Button>
        </div>

        <Button variant="outline" size="sm">
          Próxima
        </Button>
      </nav>
    );
  }

  const items = buildPageItems(page, totalPages);
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <nav
      className={cn("flex items-center justify-between gap-3", className)}
      aria-label="Paginação"
    >
      <Button
        variant="outline"
        size="sm"
        disabled={!canPrev}
        onClick={() => onPageChange(page - 1)}
      >
        Anterior
      </Button>

      <div className="flex items-center gap-2">
        {items.map((item, index) => {
          if (item === "ellipsis") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-1 text-sm text-zinc-500"
              >
                …
              </span>
            );
          }

          const isCurrent = item === page;

          return (
            <Button
              key={item}
              variant={isCurrent ? "secondary" : "outline"}
              size="sm"
              aria-current={isCurrent ? "page" : undefined}
              onClick={() => onPageChange(item)}
            >
              {item}
            </Button>
          );
        })}
      </div>

      <Button
        variant="outline"
        size="sm"
        disabled={!canNext}
        onClick={() => onPageChange(page + 1)}
      >
        Próxima
      </Button>
    </nav>
  );
}
