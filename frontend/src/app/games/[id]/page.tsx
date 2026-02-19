import { Navbar } from "@/components/Navbar";
import { GameDetailsClient } from "@/components/game-details/GameDetailsClient";

export default async function GameDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="min-h-screen">
      <Navbar />

      <GameDetailsClient gameId={id} />
    </div>
  );
}
