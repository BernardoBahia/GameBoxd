import { Navbar } from "@/components/Navbar";
import { GamesClient } from "@/components/games/GamesClient";

export default function GamesPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-10">
        <GamesClient />
      </main>
    </div>
  );
}
