import { NextResponse } from "next/server";
import { addDays } from "date-fns";
import { z } from "zod";
import { apiError } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  title: z.string().min(3),
  area: z.string().min(2),
  inspector: z.string().min(2),
  risk: z.enum(["LOW", "MODERATE", "HIGH", "EXTREME"]),
  score: z.coerce.number().int().min(0).max(100),
  findings: z.string().min(3),
});

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json());
    const count = await prisma.inspection.count();
    const created = await prisma.inspection.create({
      data: {
        ...input,
        code: `INS-${String(count + 1001).padStart(5, "0")}`,
        status: input.score < 80 ? "TRIAGED" : "COMPLETED",
        dueAt: addDays(new Date(), 7),
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return apiError(error, "Unable to create inspection");
  }
}
