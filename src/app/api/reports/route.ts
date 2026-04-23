import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { workOrderKpis, workOrderMetrics } from "@/lib/work-order-analytics";

type ReportRow = Record<string, string | number | boolean | null>;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const type = url.searchParams.get("type") || "assets";
  const format = url.searchParams.get("format") || "preview";
  const filters = reportFilters(url);
  const rows = await reportRows(type, filters);
  const kpis = type === "work-orders" ? workOrderKpis(rows) : null;

  if (format === "csv") {
    return file(csv(rows), "text/csv", `${type}.csv`);
  }
  if (format === "excel") {
    return file(excel(rows, type, kpis), "application/vnd.ms-excel", `${type}.xls`);
  }
  if (format === "pdf") {
    return file(pdf(rows, type, kpis, filters), "application/pdf", `${type}.pdf`);
  }
  return NextResponse.json({ type, rows, kpis, filters });
}

function reportFilters(url: URL) {
  return {
    responseGreaterThan: numberParam(url, "responseGreaterThan"),
    resolutionGreaterThan: numberParam(url, "resolutionGreaterThan"),
    slaBreach: url.searchParams.get("slaBreach"),
    delayedOnly: url.searchParams.get("delayedOnly") === "true",
  };
}

function numberParam(url: URL, key: string) {
  const value = url.searchParams.get(key);
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

async function reportRows(type: string, filters: ReturnType<typeof reportFilters>): Promise<ReportRow[]> {
  if (type === "work-orders") {
    const rows = await prisma.workOrder.findMany({
      include: { asset: true, assignedTo: true },
      orderBy: { createdAt: "desc" },
    });
    return rows
      .map((row) => workOrderMetrics(row))
      .filter((row) => {
        if (filters.responseGreaterThan !== null && Number(row.response_duration_mins ?? -1) <= filters.responseGreaterThan) return false;
        if (filters.resolutionGreaterThan !== null && Number(row.response_to_resolution_mins ?? -1) <= filters.resolutionGreaterThan) return false;
        if (filters.slaBreach === "yes" && !row.sla_breached) return false;
        if (filters.slaBreach === "no" && row.sla_breached) return false;
        if (filters.delayedOnly && !row.delayed) return false;
        return true;
      });
  }
  if (type === "requests") {
    const rows = await prisma.serviceRequest.findMany({ orderBy: { createdAt: "desc" } });
    return rows.map((row) => ({ ticketNo: row.ticketNo, title: row.title, category: row.category, requester: row.requester, priority: row.priority, status: row.status, location: row.location }));
  }
  if (type === "inventory") {
    const rows = await prisma.inventoryItem.findMany({ orderBy: { name: "asc" } });
    return rows.map((row) => ({ sku: row.sku, name: row.name, category: row.category, onHand: row.onHand, reorderPoint: row.reorderPoint, unitCost: Number(row.unitCost), vendor: row.vendor }));
  }
  if (type === "ppm") {
    const rows = await prisma.preventiveMaintenance.findMany({ orderBy: { nextDue: "asc" } });
    return rows.map((row) => ({ code: row.code, name: row.name, assetTag: row.assetTag, frequency: row.frequency, nextDue: row.nextDue.toISOString().slice(0, 10), active: row.active }));
  }
  const rows = await prisma.asset.findMany({ include: { building: true, site: true }, orderBy: { tag: "asc" } });
  return rows.map((row) => ({ tag: row.tag, name: row.name, category: row.category, system: row.system, status: row.status, building: row.building?.name ?? "", floor: row.floor ?? "", room: row.room ?? "", condition: row.conditionScore, cost: Number(row.purchaseCost) }));
}

function csv(rows: ReportRow[]) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  return [headers.join(","), ...rows.map((row) => headers.map((header) => quote(row[header])).join(","))].join("\n");
}

function excel(rows: ReportRow[], title: string, kpis: Record<string, unknown> | null) {
  const headers = rows[0] ? Object.keys(rows[0]) : [];
  return `<html><body><h1>${title}</h1>${kpiHtml(kpis)}<table border="1"><thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${headers.map((h) => `<td>${row[h] ?? ""}</td>`).join("")}</tr>`).join("")}</tbody></table></body></html>`;
}

function pdf(rows: ReportRow[], title: string, kpis: Record<string, unknown> | null, filters: ReturnType<typeof reportFilters>) {
  const kpiLines = kpis ? Object.entries(kpis).map(([key, value]) => `${key}: ${value ?? "-"}`) : [];
  const filterLines = [`Filters: response>${filters.responseGreaterThan ?? "-"} mins, resolution>${filters.resolutionGreaterThan ?? "-"} mins, sla=${filters.slaBreach ?? "all"}, delayed=${filters.delayedOnly ? "yes" : "no"}`];
  const lines = [`BrightWorks CAFM Report: ${title}`, `Generated: ${new Date().toISOString()}`, ...filterLines, ...kpiLines, "", ...rows.slice(0, 35).map((row) => Object.values(row).join(" | "))];
  const text = lines.join("\\n").replace(/[()\\]/g, "");
  return `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj
3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>endobj
4 0 obj<</Length ${text.length + 64}>>stream
BT /F1 9 Tf 40 760 Td (${text}) Tj ET
endstream endobj
5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj
xref
0 6
0000000000 65535 f 
trailer<</Root 1 0 R/Size 6>>
startxref
0
%%EOF`;
}

function kpiHtml(kpis: Record<string, unknown> | null) {
  if (!kpis) return "";
  return `<h2>KPI Summary</h2><ul>${Object.entries(kpis).map(([key, value]) => `<li>${key}: ${value ?? "-"}</li>`).join("")}</ul>`;
}

function quote(value: unknown) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function file(body: string, contentType: string, filename: string) {
  return new NextResponse(body, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
