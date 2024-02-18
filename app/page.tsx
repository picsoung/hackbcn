"use client";

import React, { useState } from "react";
import Navbar from "@/app/components/Navbar";
import Hero from "@/app/components/Hero";
import Sponsors from "./components/Sponsors";
import WhyJoin from "./components/WhyJoin";
import Schedule from "./components/Schedule";
import Dates from "./components/Dates";
import SignupCTA from "./components/SignupCTA";
import Team from "./components/Team";
import Footer from "./components/Footer";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigationOptions = [
    { name: "Sponsors", href: "#" },
    { name: "Why should I Join?", href: "#" },
    { name: "Schedule", href: "#" },
    { name: "Organizing Team", href: "#" },
  ];

  return (
    <div>
      <Navbar
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        navigationOptions={navigationOptions}
      />
      <main className="flex min-h-screen flex-col">
        <Hero />
        <Sponsors />
        <WhyJoin />
        <Dates />
        <Schedule />
        <SignupCTA />
        <Team />
        <Footer />
      </main>
    </div>
  );
}
