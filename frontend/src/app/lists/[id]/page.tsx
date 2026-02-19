import { Navbar } from "@/components/Navbar";
import { ListDetailsClient } from "@/components/lists/ListDetailsClient";

export default async function ListDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-10">
        <ListDetailsClient listId={id} />
      </main>
    </div>
  );
}
