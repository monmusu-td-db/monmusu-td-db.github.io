import "@/app/bootstrap.scss";
import "./layout.css";
import { StatesRoot } from "../components/UI/StatesRoot";
import Theme from "@/components/UI/Theme";
import type { Metadata } from "next";
import Footer from "./Footer";
import LoadingIndicator from "@/components/UI/LoadingIndicator";
import PanelControl from "@/components/UI/PanelControl";

const SITE_URL = "http://localhost:3000/"; // TODO
const TITLE = "モンスター娘TD DB";
const DESC =
  "モンスター娘TDのキャラクターの能力値、バフデバフをまとめているサイトです。";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: `%s - ${TITLE}`,
    default: TITLE,
  },
  description: DESC,
  icons: {
    icon: "/favicon.png",
  },
  openGraph: {
    title: TITLE,
    images: "/ogp.jpg",
    description: DESC,
    locale: "ja_JP",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    site: "@kd1042",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body>
        <Theme.Initialize />
        <LoadingIndicator />
        <PanelControl />
        <StatesRoot>{children}</StatesRoot>
        <Footer />
      </body>
    </html>
  );
}
