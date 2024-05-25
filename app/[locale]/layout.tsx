import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./../globals.css";
import { Analytics } from "@vercel/analytics/react";
import { IntlProvider } from "../components/Intl";
import i18nConfig from '../../i18n.json';

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata(args: any) {
  const finalLocale = [
    i18nConfig.locale.source,
    ...i18nConfig.locale.targets,
  ].includes(args.params.locale) ? args.params.locale : i18nConfig.locale.source;

  const localeData = await loadLocaleData(finalLocale);
  return {
    title: localeData["meta.title"],
    description: localeData["meta.description"],
    icons: {
      icon: ["/favicon.ico?v=4"],
    },
    manifest: "/site.webmanifest",
    metadataBase: new URL("https://hackbcn.com"),
    alternates: {
      canonical: '/',
      languages: {
        'x-default': '/',
        'en': '/en',
        'fr': '/fr',
        'es': '/es',
        'ca': '/ca',
      },
    },
    openGraph: {
      type: "website",
      url: "https://hackbcn.com",
      title: localeData["meta.title"],
      description: localeData["meta.description-og"],
      siteName: localeData["meta.name"],
      images: "/og_image.png",
    },
  } satisfies Metadata;
}

export default async function HomeLayout(props: { children: any, params: { locale: string } }) {
  const localeData = await loadLocaleData(props.params.locale);
  const allLocales = [
    i18nConfig.locale.source,
    ...i18nConfig.locale.targets,
  ];

  return (
    <IntlProvider
      locale={props.params.locale}
      data={localeData}
      locales={allLocales}
    >
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
