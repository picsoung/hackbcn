import { redirect } from "next/navigation";
import i18nConfig from '../i18n.json';

export default async function Home() {
  const defaultLocale = i18nConfig.locale.source;
  return redirect(`/${defaultLocale}`);
}