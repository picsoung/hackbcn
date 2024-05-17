import HomeContent from "./content";
import i18nConfig from '../../i18n.json';
import { redirect } from "next/navigation";

export default async function Home(props: { params: { locale: string } }) {
  const supportedLocales = [
    i18nConfig.locale.source,
    ...i18nConfig.locale.targets,
  ];
  const isValidLocale = supportedLocales.includes(props.params.locale);
  if (!isValidLocale) { return redirect(`/${i18nConfig.locale.source}`); }

  return <HomeContent />;
}
