import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  companyId: z.string().min(1),
  nationalityType: z.string().min(2),
  departmentCode: z.string().min(1),
  siteLocation: z.string().min(2),
});

export async function GET() {
  return NextResponse.json(await prisma.employee.findMany({ orderBy: { name: "asc" } }));
}

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json());
    const employee = await prisma.employee.upsert({
      where: { companyId: input.companyId },
      update: input,
      create: input,
    });
    return NextResponse.json(employee, { status: 201 });
  } catch (error) {
    return apiError(error, "Unable to save employee");
  }
}
