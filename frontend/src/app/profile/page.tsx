import { Navbar } from "@/components/Navbar";
import { ProfileClient } from "@/components/profile/ProfileClient";

export default function ProfilePage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-10">
        <ProfileClient />
      </main>
    </div>
  );
}
