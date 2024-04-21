"use client";
import React, { Dispatch, SetStateAction } from "react";
import { Disclosure } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import ApplyButton from "./ApplyButton";

import Link from "next/link";

interface NavbarProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: Dispatch<SetStateAction<boolean>>;
  navigationOptions: { name: string; href: string }[];
}

const Navbar: React.FC<NavbarProps> = ({
  mobileMenuOpen,
  setMobileMenuOpen,
  navigationOptions,
}) => {
  return (
    <Disclosure as="nav">
      {({ open }) => {
        if (open !== mobileMenuOpen) setMobileMenuOpen(open);
        return (
          <>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 justify-between items-center">
                {/* Left side - Logo, HackBCN text, and Apply button */}
                <div className="flex items-center">
                  <Link href="#" className="inline-flex items-center mr-5">
                    <img
                      className="h-8 w-auto"
                      src="/hackbcnlogo.png"
                      alt="HackBCN logo"
                    />
                    <h3 className="pl-2 text-white text-lg font-medium">
                      HackBCN
                    </h3>
                  </Link>
                </div>

                {/* Center - Navigation Links */}
                <div className="hidden sm:ml-6 sm:flex sm:space-x-5">
                  {navigationOptions.map((option) => (
                    <Link
                      key={option.name}
                      href={option.href}
                      className="inline-flex items-center px-1 pt-1 text-lg font-medium text-black-200 hover:text-indigo-700"
                    >
                      <p>{option.name}</p>
                    </Link>
                  ))}
                </div>

                {/* Left - Navigation Links */}
                <ApplyButton />

                {/* Mobile menu button */}
                <div className="-mr-2 flex items-center sm:hidden">
                  <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
              </div>
            </div>

            {/* Mobile menu */}
            <Disclosure.Panel className="sm:hidden">
              <div className="space-y-1 pb-3 pt-2">
                {navigationOptions.map((option) => (
                  <Link
                    key={option.name}
                    href={option.href}
                    className="block py-1.5 pl-10 pr-4 text-lg font-medium text-black-200 hover:text-indigo-700"
                  >
                    {option.name}
                  </Link>
                ))}
              </div>
            </Disclosure.Panel>
          </>
        );
      }}
    </Disclosure>
  );
};
export default Navbar;
