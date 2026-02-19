import { Hero } from "@/components/Hero";
import { Navbar } from "@/components/Navbar";
import { SectionTitle } from "@/components/SectionTitle";
import { HighlightsGrid } from "@/components/games/HighlightsGrid";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <Hero />

      <main id="jogos" className="mx-auto max-w-6xl px-4 pb-12">
        <SectionTitle
          as="h2"
          title="Jogos em destaque"
          description="Uma seleção rápida para visualizar reviews, notas e gêneros."
          right={
            <Button asChild variant="outline">
              <Link href="/games">Ver mais jogos</Link>
            </Button>
          }
        />

        <HighlightsGrid />
      </main>
    </div>
  );
}
