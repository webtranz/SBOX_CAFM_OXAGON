import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { error } = await requirePermission("roles.manage");
  if (error) return error;
  const [permissions, rolePermissions] = await Promise.all([
    prisma.permission.findMany({ orderBy: [{ module: "asc" }, { name: "asc" }] }),
    prisma.rolePermission.findMany({ include: { permission: true }, orderBy: { role: "asc" } }),
  ]);

  return NextResponse.json({ permissions, rolePermissions });
}
