import { cn } from "@/lib/utils";

export interface GameBannerProps {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  className?: string;
}

export function GameBanner({
  title,
  subtitle,
  imageUrl,
  className,
}: GameBannerProps) {
  return (
    <section className={cn("mx-auto max-w-6xl px-4 pt-8", className)}>
      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/30 shadow-sm">
        <div className="relative">
          <div className="relative aspect-[21/9] w-full bg-zinc-900">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={title}
                className="absolute inset-0 h-full w-full object-cover object-top"
                loading="eager"
                decoding="async"
              />
            ) : null}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 via-zinc-900/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
            <p className="text-xs font-medium tracking-wide text-zinc-400">
              Detalhes do jogo
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-300">
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
