import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  code: z.string().min(1),
  name: z.string().min(2),
  siteLocation: z.string().min(2),
  description: z.string().optional(),
});

export async function GET() {
  return NextResponse.json(await prisma.department.findMany({ orderBy: { code: "asc" } }));
}

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json());
    const department = await prisma.department.upsert({
      where: { code: input.code },
      update: { name: input.name, siteLocation: input.siteLocation, description: input.description || "" },
      create: { code: input.code, name: input.name, siteLocation: input.siteLocation, description: input.description || "" },
    });
    return NextResponse.json(department, { status: 201 });
  } catch (error) {
    return apiError(error, "Unable to save department");
  }
}
