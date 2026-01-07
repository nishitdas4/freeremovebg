import type { Metadata } from "next";
import Remover from "@/components/Remover";

export const metadata: Metadata = {
  title: "FreeBgAI | Unlimited Local Background Remover Studio",
  description: "Remove image backgrounds instantly in your browser (Offline Mode). 100% Free, Private, and Unlimited HD Downloads. The best alternative to PhotoRoom for creators.",
  alternates: {
    canonical: "https://freebgai.com",
  },
};

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Remover />
    </main>
  );
}