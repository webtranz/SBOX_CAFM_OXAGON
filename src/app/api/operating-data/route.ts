import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api-auth";
import { getOperatingData } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = await requireUser();
  if (error) return error;
  const user = await getCurrentUser();
  const data = await getOperatingData(user);
  return NextResponse.json(JSON.parse(JSON.stringify(data)));
}
