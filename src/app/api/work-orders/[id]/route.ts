import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  status: z.enum(["NEW", "TRIAGED", "ASSIGNED", "IN_PROGRESS", "ON_HOLD", "COMPLETED", "CLOSED"]),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const input = schema.parse(await request.json());
    const updated = await prisma.workOrder.update({
      where: { id },
      data: {
        status: input.status,
        actualHours: ["COMPLETED", "CLOSED"].includes(input.status) ? 4 : undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return apiError(error, "Unable to update work order");
  }
}
