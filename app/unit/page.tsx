import { TablesUnit } from "@/components/UI/Tables";
import PageRoot from "@/components/UI/PageRoot";
import type { Metadata } from "next";

const DESC =
  "このページではモンスター娘TDのキャラクターの能力値を、サブスキルや編成バフなどに合わせて計算できます。";

export const metadata: Metadata = {
  title: "キャラクター一覧",
  description: DESC,
};

export default function App() {
  return (
    <PageRoot>
      <TablesUnit id="unit" maxRows={100} showIcon />
    </PageRoot>
  );
}
