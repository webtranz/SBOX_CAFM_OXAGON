ALTER TABLE "AuditLog" ADD COLUMN "logKey" TEXT;

UPDATE "AuditLog"
SET "logKey" = 'AUD-' ||
  to_char("createdAt", 'YYYYMMDD-HH24MISS-MS') || '-' ||
  regexp_replace(upper("action"), '[^A-Z0-9]+', '-', 'g') || '-' ||
  left("id", 8)
WHERE "logKey" IS NULL;

ALTER TABLE "AuditLog" ALTER COLUMN "logKey" SET NOT NULL;

CREATE UNIQUE INDEX "AuditLog_logKey_key" ON "AuditLog"("logKey");
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
CREATE INDEX "AuditLog_actorName_idx" ON "AuditLog"("actorName");
CREATE INDEX "AuditLog_role_idx" ON "AuditLog"("role");
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");
CREATE INDEX "AuditLog_entity_idx" ON "AuditLog"("entity");

DELETE FROM "AuditLog"
WHERE "createdAt" < now() - interval '30 days';
