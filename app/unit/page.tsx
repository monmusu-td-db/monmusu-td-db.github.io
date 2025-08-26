import { TablesUnit } from "@/components/UI/Tables";
import PageRoot from "@/components/UI/PageRoot";

export default function App() {
  return (
    <PageRoot>
      <TablesUnit id="unit" maxRows={100} showIcon />
    </PageRoot>
  );
}
