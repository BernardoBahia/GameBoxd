import { GameCard, type GameCardProps } from "@/components/GameCard";
import { cn } from "@/lib/utils";

export interface GameGridProps {
  games: Array<
    Pick<
      GameCardProps,
      | "title"
      | "description"
      | "siteRating"
      | "metacritic"
      | "genre"
      | "genres"
      | "detailsHref"
      | "imageUrl"
    >
  >;
  showHeaderRatings?: boolean;
  showReviewButton?: boolean;
  className?: string;
}

export function GameGrid({
  games,
  showHeaderRatings = true,
  showReviewButton = true,
  className,
}: GameGridProps) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {games.map((game, index) => (
        <GameCard
          key={`${game.title}-${index}`}
          title={game.title}
          description={game.description}
          siteRating={game.siteRating}
          metacritic={game.metacritic}
          genre={game.genre}
          genres={game.genres}
          imageUrl={game.imageUrl}
          detailsHref={game.detailsHref}
          showHeaderRatings={showHeaderRatings}
          showReviewButton={showReviewButton}
        />
      ))}
    </div>
  );
}
