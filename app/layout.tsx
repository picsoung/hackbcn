import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";

// import { ReplexicaIntlProvider } from "@replexica/react/client";
// import { loadLocaleFromCookie } from "@replexica/react/next";

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
      "Together, let's put BCN on the map of AI innovation. Join 50+ hackers to play with GPT, LLama and RAG to create ground breaking projects.",
    siteName: "HackBCN",
    images: "https://hackbcn.com/og_image.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = "en"; //await loadLocaleFromCookie();
  // Note the .client.json suffix of the i18n file below.
  // It means that only the values *actually used* get passed to the client, not the entire i18n dictionary.

  // const localeData = await import(
  //   `@replexica/translations/${locale}.client.json`
  // ).then((m) => m.default);

  return (
    // <ReplexicaIntlProvider data={localeData}>
    <html>
      <body className={inter.className}>
        {children}
        <Analytics />
      </body>
    </html>
    // </ReplexicaIntlProvider>
  );
}
