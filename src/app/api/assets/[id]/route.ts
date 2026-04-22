import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  tag: z.string().min(3),
  name: z.string().min(3),
  category: z.string().min(2),
  system: z.string().min(2),
  criticality: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  status: z.enum(["ACTIVE", "STANDBY", "DOWN", "RETIRED"]),
  serialNumber: z.string().optional(),
  siteCode: z.string().optional(),
  zone: z.string().optional(),
  buildingCode: z.string().optional(),
  assetGroup: z.string().optional(),
  assetDescription: z.string().optional(),
  additionalDescription: z.string().optional(),
  parentAsset: z.string().optional(),
  departmentCode: z.string().optional(),
  remarks: z.string().optional(),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  floor: z.string().optional(),
  room: z.string().optional(),
  warrantyExpiry: z.string().optional(),
  contractRef: z.string().optional(),
  documentationUrl: z.string().optional(),
  purchaseCost: z.coerce.number().min(0),
  salvageValue: z.coerce.number().min(0),
  depreciationRate: z.coerce.number().min(0).max(100),
  conditionScore: z.coerce.number().min(0).max(100),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const input = schema.parse(await request.json());
    const updated = await prisma.asset.update({
      where: { id },
      data: {
        tag: input.tag,
        name: input.name,
        category: input.category,
        system: input.system,
        criticality: input.criticality,
        status: input.status,
        serialNumber: input.serialNumber || null,
        siteCode: input.siteCode || null,
        zone: input.zone || null,
        buildingCode: input.buildingCode || null,
        assetGroup: input.assetGroup || input.category,
        assetDescription: input.assetDescription || input.name,
        additionalDescription: input.additionalDescription || null,
        parentAsset: input.parentAsset || null,
        departmentCode: input.departmentCode || null,
        remarks: input.remarks || null,
        manufacturer: input.manufacturer || "Not specified",
        model: input.model || "Not specified",
        floor: input.floor || null,
        room: input.room || null,
        warrantyExpiry: input.warrantyExpiry ? new Date(input.warrantyExpiry) : null,
        contractRef: input.contractRef || null,
        documentationUrl: input.documentationUrl || null,
        purchaseCost: input.purchaseCost,
        salvageValue: input.salvageValue,
        depreciationRate: input.depreciationRate,
        conditionScore: input.conditionScore,
        qrCode: `CAFM-ASSET:${input.tag}`,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return apiError(error, "Unable to update asset");
  }
}
