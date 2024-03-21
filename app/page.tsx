"use client";

import React, { useState } from "react";
import Navbar from "@/app/components/Navbar";
import Hero from "@/app/components/Hero";
import Sponsors from "./components/Sponsors";
import Judges from "./components/Judges";
import WhyJoin from "./components/WhyJoin";
import Schedule from "./components/Schedule";
import Dates from "./components/Dates";
import SignupCTA from "./components/SignupCTA";
import Team from "./components/Team";
import Footer from "./components/Footer";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigationOptions = [
    { name: "Sponsors", href: "#sponsors" },
    { name: "Why should I Join?", href: "#why" },
    { name: "Schedule", href: "#schedule" },
    { name: "Organizing Team", href: "#about" },
    { name: "Judges", href: "#judges" },
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
        <Judges />
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
