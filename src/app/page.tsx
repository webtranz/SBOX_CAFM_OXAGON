import { getOperatingData } from "@/lib/data";
import { CafmConsole } from "@/components/cafm-console";

export const dynamic = "force-dynamic";

export default async function Home() {
  const data = await getOperatingData();
  const serialized = JSON.parse(JSON.stringify(data));
  return <CafmConsole data={serialized} />;
}
