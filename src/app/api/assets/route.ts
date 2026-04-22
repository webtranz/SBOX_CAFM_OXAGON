import { NextResponse } from "next/server";
import { addYears } from "date-fns";
import { z } from "zod";
import { apiError } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  tag: z.string().min(3),
  name: z.string().min(3),
  category: z.string().min(2),
  system: z.string().min(2),
  criticality: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  purchaseCost: z.coerce.number().min(0).optional(),
  conditionScore: z.coerce.number().min(0).max(100).optional(),
});

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json());
    const site = await prisma.site.findFirst({ include: { buildings: { take: 1 } } });

    if (!site) {
      return apiError(new Error("Create or seed a site before adding assets."), "No site available", 400);
    }

    const created = await prisma.asset.create({
      data: {
        tag: input.tag,
        name: input.name,
        category: input.category,
        system: input.system,
        criticality: input.criticality,
        manufacturer: input.manufacturer || "Not specified",
        model: input.model || "Not specified",
        installDate: new Date(),
        replacementDate: addYears(new Date(), 8),
        purchaseCost: input.purchaseCost ?? 0,
        conditionScore: input.conditionScore ?? 85,
        siteId: site.id,
        buildingId: site.buildings[0]?.id,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return apiError(error, "Unable to create asset");
  }
}
