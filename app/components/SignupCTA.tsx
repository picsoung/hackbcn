"use client";
import React from "react";
import Link from "next/link";

export default function SignupCTA() {
  return (
    <div className="py-12">
      <div className="flex max-w-7xl mx-auto px-8">
        <div className="w-2/3">
          <h3 className="font-cal text-5xl text-orange-100">
            Join us at IvyHacks 2024
          </h3>
          <p className="mt-4 font-light text-orange-300">
            Sign up in minutes and get ready to hack!
          </p>
        </div>
        <div className="pt-6 w-1/3 relative">
          <Link
            href="/signup"
            className="absolute right-0 rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-orange-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            Apply to IvyHacks
          </Link>
        </div>
      </div>
    </div>
  );
}
