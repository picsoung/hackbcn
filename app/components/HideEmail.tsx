import GradientHero from "./GradientHero";
import Link from "next/link";
import ApplyButton from "./ApplyButton";
import Image from "next/image"; // Add this import
import { useIntl } from "./Intl";
import React from "react";

interface HideEmailProps {
  emailAddr: string;
}
const HideEmail: React.FC<HideEmailProps> = ({ emailAddr }) => {
  const email = emailAddr || "fake@email.com";
  const obfuscatedEmail = email.split("").reverse().join("");

  return (
    <span style={{ unicodeBidi: "bidi-override", direction: "rtl" }}>
      {obfuscatedEmail}
    </span>
  );
};

export default HideEmail;
