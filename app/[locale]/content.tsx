"use client";

import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Sponsors from "../components/Sponsors";
import Judges from "../components/Judges";
import WhyJoin from "../components/WhyJoin";
import FAQ from "../components/FAQ";
import Schedule from "../components/Schedule";
import Dates from "../components/Dates";
import SignupCTA from "../components/SignupCTA";
import Team from "../components/Team";
import Footer from "../components/Footer";
// import CommunitySponsors from "./components/CommunitySponsors";

export default function HomeContent() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigationOptions = [
    { name: "Sponsors", href: "#sponsors" },
    { name: "Why should I Join?", href: "#why" },
    { name: "Schedule", href: "#schedule" },
    { name: "FAQ", href: "#faq" },
    { name: "Team", href: "#about" },
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
        {/* <CommunitySponsors /> */}
        <Judges />
        <WhyJoin />
        <Dates />
        <Schedule />
        <SignupCTA />
        <FAQ />
        <Team />
        <Footer />
      </main>
    </div>
  );
}
