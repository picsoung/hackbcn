import Image from "next/image";
import Navbar from "@app/components/navbar";

export default function Home() {
  return (
    <div className="bg-gradient-radial from-blue-400 to-purple-500 h-screen w-screen fixed top-0 left-0">
      <Navbar />
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <h1>Hello World</h1>
      </main>
    </div>
  );
}
