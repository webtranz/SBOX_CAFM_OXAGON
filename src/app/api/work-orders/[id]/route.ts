import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  title: z.string().min(3).optional(),
  type: z.string().min(2).optional(),
  assetType: z.string().optional(),
  departmentCode: z.string().optional(),
  serviceCode: z.string().optional(),
  assignedTeamCode: z.string().optional(),
  assignedToEmail: z.string().optional(),
  jobPlanCode: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  status: z.enum(["NEW", "TRIAGED", "ASSIGNED", "IN_PROGRESS", "ON_HOLD", "COMPLETED", "CLOSED"]).optional(),
  assetTag: z.string().optional(),
  jobPlan: z.string().min(3).optional(),
  safetyNotes: z.string().optional(),
  estimatedHours: z.coerce.number().optional(),
  cost: z.coerce.number().optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const input = schema.parse(await request.json());
    const [asset, assignedUser] = await Promise.all([
      input.assetTag ? prisma.asset.findUnique({ where: { tag: input.assetTag } }) : null,
      input.assignedToEmail ? prisma.user.findUnique({ where: { email: input.assignedToEmail } }) : null,
    ]);
    const updated = await prisma.workOrder.update({
      where: { id },
      data: {
        title: input.title,
        type: input.type,
        assetType: input.assetType,
        departmentCode: input.departmentCode,
        serviceCode: input.serviceCode,
        assignedTeamCode: input.assignedTeamCode,
        jobPlanCode: input.jobPlanCode,
        priority: input.priority,
        status: input.status,
        assetId: asset?.id,
        assignedToId: assignedUser?.id,
        jobPlan: input.jobPlan,
        safetyNotes: input.safetyNotes,
        estimatedHours: input.estimatedHours,
        cost: input.cost,
        actualHours: input.status && ["COMPLETED", "CLOSED"].includes(input.status) ? 4 : undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return apiError(error, "Unable to update work order");
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.workOrder.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiError(error, "Unable to delete work order");
  }
}
