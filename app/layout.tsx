import "@/app/bootstrap.scss";
import "./layout.css";
import { StatesRoot } from "../components/UI/StatesRoot";
import Theme from "@/components/UI/Theme";
import type { Metadata } from "next";
import Footer from "./Footer";
import LoadingIndicator from "@/components/UI/LoadingIndicator";
import PanelControl from "@/components/UI/PanelControl";

export const metadata: Metadata = {
  title: "モンスター娘TD DB",
  description:
    "モンスター娘TDのキャラクターの能力値、バフデバフをまとめているサイトです。",
  icons: {
    icon: "/favicon.png",
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
