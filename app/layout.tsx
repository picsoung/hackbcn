import { CSPostHogProvider } from "./providers";
export default function RootLayout(props: any) {
  return <CSPostHogProvider>{props.children}</CSPostHogProvider>;
}
