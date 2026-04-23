import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  departmentName: z.string().optional(),
  departmentCode: z.string().optional(),
});

export async function GET() {
  return NextResponse.json(await prisma.serviceCatalog.findMany({ include: { team: true }, orderBy: { name: "asc" } }));
}

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json());
    const count = await prisma.serviceCatalog.count();
    const code = input.departmentCode || `SRV-${String(count + 1).padStart(4, "0")}`;
    const name = input.departmentName || "General Service";
    const created = await prisma.serviceCatalog.upsert({
      where: { code },
      update: {
        name,
        category: name,
        type: "Department Service",
        priority: "MEDIUM",
        slaHours: 24,
        description: `Department ${name}`,
      },
      create: {
        code,
        name,
        category: name,
        type: "Department Service",
        priority: "MEDIUM",
        slaHours: 24,
        description: `Department ${name}`,
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return apiError(error, "Unable to save service");
  }
}
