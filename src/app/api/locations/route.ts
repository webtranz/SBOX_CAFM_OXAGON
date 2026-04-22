import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  code: z.string().min(2),
  site: z.string().min(2),
  zone: z.string().min(1),
  building: z.string().min(1),
  floor: z.string().min(1),
  room: z.string().min(1),
  type: z.string().min(2),
  description: z.string().optional(),
});

export async function GET() {
  return NextResponse.json(await prisma.location.findMany({ orderBy: [{ site: "asc" }, { building: "asc" }, { floor: "asc" }, { room: "asc" }] }));
}

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json());
    const location = await prisma.location.upsert({
      where: { code: input.code },
      update: { ...input, description: input.description || "" },
      create: { ...input, description: input.description || "" },
    });
    return NextResponse.json(location, { status: 201 });
  } catch (error) {
    return apiError(error, "Unable to save location");
  }
}
