import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  code: z.string().min(2),
  name: z.string().min(3),
  assetType: z.string().min(2),
  departmentCode: z.string().optional(),
  serviceCode: z.string().optional(),
  estimatedHours: z.coerce.number().min(0),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  steps: z.string().min(3),
  safetyNotes: z.string().optional(),
});

export async function GET() {
  return NextResponse.json(await prisma.jobPlan.findMany({ orderBy: { code: "asc" } }));
}

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json());
    const jobPlan = await prisma.jobPlan.upsert({
      where: { code: input.code },
      update: { ...input, safetyNotes: input.safetyNotes || "" },
      create: { ...input, safetyNotes: input.safetyNotes || "" },
    });
    return NextResponse.json(jobPlan, { status: 201 });
  } catch (error) {
    return apiError(error, "Unable to save job plan");
  }
}
