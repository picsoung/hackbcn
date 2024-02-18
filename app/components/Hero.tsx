"use client";
import { useState } from "react";
import GradientHero from "./GradientHero";
import Link from "next/link";
import Card from "./Card"; // Make sure to import the Card component

const navigationOptions = [
  { name: "Sponsors", href: "#" },
  { name: "Why Join?", href: "#" },
  { name: "Schedule", href: "#" },
  { name: "Organizing Team", href: "#" },
];

export default function Hero() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div>
      <main>
        <GradientHero />

        <div className="relative isolate">
          <div
            className="absolute left-1/2 right-0 top-0 -z-10 -ml-24 transform-gpu overflow-hidden blur-3xl lg:ml-24 xl:ml-48"
            aria-hidden="true"
          >
            <div
              className="aspect-[801/1036] w-[50.0625rem] bg-gradient-to-tr from-[#ffb580] to-[#fcb589] opacity-30"
              style={{
                clipPath:
                  "polygon(63.1% 29.5%, 100% 17.1%, 76.6% 3%, 48.4% 0%, 44.6% 4.7%, 54.5% 25.3%, 59.8% 49%, 55.2% 57.8%, 44.4% 57.2%, 27.8% 47.9%, 35.1% 81.5%, 0% 97.7%, 39.2% 100%, 35.2% 81.4%, 97.2% 52.8%, 63.1% 29.5%)",
              }}
            />
          </div>
          <div className="overflow-hidden">
            <div className="mx-auto max-w-7xl px-6 pb-32 pt-36 sm:pt-60 lg:px-8 lg:pt-32">
              <div className="mx-auto max-w-2xl gap-x-14 lg:mx-0 lg:flex lg:max-w-none lg:items-center">
                <div className="w-full max-w-xl lg:shrink-0 xl:max-w-2xl">
                  <h1 className="text-4xl font-cal text-white sm:text-6xl">
                    IvyHacks: NYC
                  </h1>
                  <p className="relative mt-6 text-lg leading-8 text-gray-300 sm:max-w-md lg:max-w-none">
                    Join us for for the first edition of IvyHacks, at an amazing
                    venue in NYC, and be part of a thrilling hackathon with
                    plenty of prizes, swag and fun.
                    <br />
                    <br />
                    Get ready for an unforgettable experience to showcase your
                    AI skills.
                  </p>
                  <div className="mt-10 flex items-center gap-x-6">
                    <Link
                      href="/signup"
                      className="rounded-md px-3.5 py-2.5 text-sm font-semibold shadow-sm text-gray-200 bg-indigo-600 hover:bg-indigo-700 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white-600 z-30"
                    >
                      Apply
                    </Link>
                    <Link
                      href="mailto:andrew.siah@columbia.edu"
                      className="text-sm font-semibold leading-6 text-gray-300 hover:text-white z-30"
                    >
                      Sponsor Us
                    </Link>
                  </div>
                </div>
                <div className="mt-14 flex justify-end gap-8 sm:-mt-44 sm:justify-start sm:pl-20 lg:mt-0 lg:pl-0">
                  <div className="ml-auto w-44 flex-none space-y-8 pt-32 sm:ml-0 sm:pt-80 lg:order-last lg:pt-36">
                    <Card name="Warp" imageSrc="/cards/warp.png" />
                    <Card
                      name="YourCompany"
                      imageSrc="/cards/yourcompany.png"
                    />
                  </div>
                  <div className="mr-auto w-44 flex-none space-y-8 sm:mr-0 sm:pt-52 lg:pt-36">
                    <Card name="Modal" imageSrc="./cards/modal.png" />
                    <Card name="Jacobs" imageSrc="/cards/jacobs.png" />
                  </div>
                  <div className="w-44 flex-none space-y-8 pt-32 sm:pt-0">
                    <Card name="Columbia" imageSrc="/cards/columbia.png" />
                    <Card name="Cornell" imageSrc="/cards/cornelltech.png" />
                    <Card name="NYU" imageSrc="/cards/nyu.png" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
