import { NextResponse } from "next/server";
import { getOperatingData } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getOperatingData();
  return NextResponse.json(JSON.parse(JSON.stringify(data)));
}
