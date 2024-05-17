import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./../globals.css";
import { Analytics } from "@vercel/analytics/react";
import { IntlProvider } from "../components/Intl";

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata(args: any) {
  const localeData = await loadLocaleData(args.params.locale);
  return {
    title: localeData["meta.title"],
    description: localeData["meta.description"],
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
      title: localeData["meta.title"],
      description: localeData["meta.description-og"],
      siteName: localeData["meta.name"],
      images: "https://hackbcn.com/og_image.png",
    },
  } satisfies Metadata;
}

export default async function HomeLayout(props: { children: any, params: { locale: string } }) {
  const localeData = await loadLocaleData(props.params.locale);

  return (
    <IntlProvider locale={props.params.locale} data={localeData}>
      <html>
        <body className={inter.className}>
          {props.children}
          <Analytics />
        </body>
      </html>
    </IntlProvider>
  );
}

async function loadLocaleData(locale: string) {
  const localeData = await import(`@/i18n/${locale}.json`);
  return localeData.default;
}
