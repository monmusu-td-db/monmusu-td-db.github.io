import { TablesUnit } from "@/components/UI/Tables";
import PageRoot from "@/components/UI/PageRoot";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ユニット一覧",
};

export default function App() {
  return (
    <PageRoot>
      <TablesUnit id="unit" maxRows={100} showIcon />
    </PageRoot>
  );
}
