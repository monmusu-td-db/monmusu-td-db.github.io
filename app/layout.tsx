import "@/app/bootstrap.scss";
import "./layout.css";
import { StatesRoot } from "../components/UI/StatesRoot";
import Theme from "@/components/UI/Theme";
import type { Metadata } from "next";
import Footer from "./Footer";
import LoadingIndicator from "@/components/UI/LoadingIndicator";
import PanelControl from "@/components/UI/PanelControl";

const SITE_URL = "http://localhost:3000/"; // TODO
// const SITE_URL = "https://monmusu-td-db.github.io/"
const ASSETS_PATH = "/assets/";
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
    icon: ASSETS_PATH + "favicon.png",
    apple: ASSETS_PATH + "favicon.png",
  },
  openGraph: {
    title: TITLE,
    images: ASSETS_PATH + "ogp.jpg",
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
