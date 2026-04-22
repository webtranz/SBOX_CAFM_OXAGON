import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  sku: z.string().min(2),
  name: z.string().min(2),
  category: z.string().min(2),
  unit: z.string().min(1),
  onHand: z.coerce.number().int().min(0),
  reorderPoint: z.coerce.number().int().min(0),
  unitCost: z.coerce.number().min(0),
  vendor: z.string().min(2),
  location: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json());
    const created = await prisma.inventoryItem.upsert({
      where: { sku: input.sku },
      update: {
        name: input.name,
        category: input.category,
        unit: input.unit,
        onHand: input.onHand,
        reorderPoint: input.reorderPoint,
        unitCost: input.unitCost,
        vendor: input.vendor,
        location: input.location || "Central Store",
      },
      create: {
        ...input,
        location: input.location || "Central Store",
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return apiError(error, "Unable to save inventory item");
  }
}
