import Navbar from "@/app/components/Navbar";
import Hero from "@/app/components/Hero";
import Sponsors from "./components/Sponsors";

export default function Home() {
  return (
    <div>
      <Navbar />
      <main className="flex min-h-screen flex-col">
        <Hero />
        <Sponsors />
      </main>
    </div>
  );
}
