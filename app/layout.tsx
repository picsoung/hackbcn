import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HackBCN AI Hackathon",
  description:
    "Celebrating AI innovation in the heart of Barcelona with 100+ hackers.",
  icons: {
    icon: ["/favicon.ico?v=4"],
    apple: ["/apple-touch-icon.png?v=4"],
    shortcut: ["/apple-touch-icon.png"],
  },
  manifest: "/site.webmanifest",
  metadataBase: new URL("https://hackbcn.com"),
  openGraph: {
    type: "website",
    url: "https://hackbcn.com",
    title: "HackBCN AI Hackathon",
    description:
      "Celebrating AI innovation in the heart of Barcelona with 100+ hackers.",
    siteName: "HackBCN",
    images: "https://hackbcn.com/og_image.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
