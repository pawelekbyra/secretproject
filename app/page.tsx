import { auth } from "@/auth";
import HeroSection from "@/components/landing/HeroSection";
import StorySection from "@/components/landing/StorySection";
import VaultSection from "@/components/landing/VaultSection";

export const metadata = {
  title: "Polutek - Głos, który budzi duchy",
  description: "Ekskluzywna zbiórka na wyprawę do Gabonu.",
};

export default async function Home() {
  const session = await auth();
  const isPatron = session?.user?.role === 'patron';

  return (
    <main className="bg-[#0a0a0a] min-h-screen text-white overflow-x-hidden">
      <HeroSection />
      <StorySection />
      <VaultSection isPatron={!!isPatron} />
    </main>
  );
}
