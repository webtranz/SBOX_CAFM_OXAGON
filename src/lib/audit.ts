import { prisma } from "@/lib/prisma";

const retentionDays = 30;
let lastPurgeAt = 0;

function serializeDetails(details: unknown) {
  if (details === undefined || details === null || details === "") return null;
  if (typeof details === "string") return details;
  return JSON.stringify(details, (_key, value) => {
    if (typeof value === "bigint") return value.toString();
    if (value instanceof Date) return value.toISOString();
    return value;
  });
}

function token(value: string) {
  return value.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toUpperCase() || "LOG";
}

function auditLogKey(action: string, entity: string, createdAt: Date) {
  const stamp = createdAt.toISOString().replace(/[-:TZ.]/g, "").slice(0, 17);
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `AUD-${stamp}-${token(action)}-${token(entity)}-${suffix}`;
}

async function purgeExpiredAuditLogs() {
  const now = Date.now();
  if (now - lastPurgeAt < 60 * 60 * 1000) return;
  lastPurgeAt = now;
  const cutoff = new Date(now - retentionDays * 24 * 60 * 60 * 1000);
  await prisma.auditLog.deleteMany({ where: { createdAt: { lt: cutoff } } });
}

export async function auditAction({
  user,
  action,
  entity,
  entityId,
  details,
}: {
  user: { id?: string; name?: string; email?: string; role?: string } | null;
  action: string;
  entity: string;
  entityId: string;
  details?: unknown;
}) {
  try {
    await purgeExpiredAuditLogs();
    const createdAt = new Date();
    await prisma.auditLog.create({
      data: {
        logKey: auditLogKey(action, entity, createdAt),
        actorId: user?.id || null,
        actorName: user?.name || user?.email || "System",
        role: user?.role || "System",
        action,
        entity,
        entityId,
        createdAt,
        details: serializeDetails({
          at: createdAt.toISOString(),
          actor: {
            id: user?.id ?? null,
            name: user?.name ?? null,
            email: user?.email ?? null,
            role: user?.role ?? null,
          },
          details,
        }),
      },
    });
  } catch {
    // Audit logging must not block the CAFM operation.
  }
}
