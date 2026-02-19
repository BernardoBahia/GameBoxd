"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

export interface HeroProps {
  className?: string;
}

export function Hero({ className }: HeroProps) {
  const { isAuthenticated } = useAuth();

  return (
    <section className={cn("py-10 sm:py-14", className)}>
      <div className="mx-auto max-w-6xl px-4">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 shadow-sm sm:p-10">
          <div className="flex flex-col gap-6">
            <div className="space-y-3">
              <p className="text-xs font-medium tracking-wide text-zinc-400">
                Reviews • Listas • Favoritos
              </p>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                GameBoxd: reviews com foco total no essencial
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-zinc-400">
                Visual escuro, limpo e consistente — para você registrar notas,
                gêneros e reviews sem poluição.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button asChild>
                <Link href="/games">Ver mais jogos</Link>
              </Button>
              {isAuthenticated ? (
                <Button asChild variant="outline">
                  <Link href="/profile">Perfil</Link>
                </Button>
              ) : (
                <Button asChild variant="outline">
                  <Link href="/login">Entrar</Link>
                </Button>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
                <p className="text-sm font-medium">Alto contraste</p>
                <p className="mt-1 text-xs leading-5 text-zinc-500">
                  Tipografia simples e legível.
                </p>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
                <p className="text-sm font-medium">Cards consistentes</p>
                <p className="mt-1 text-xs leading-5 text-zinc-500">
                  Imagem, título, nota e gênero.
                </p>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
                <p className="text-sm font-medium">Microinterações</p>
                <p className="mt-1 text-xs leading-5 text-zinc-500">
                  Hover, focus e active sutis.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
