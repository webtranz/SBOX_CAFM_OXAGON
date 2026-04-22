import { NextResponse } from "next/server";

const templates: Record<string, string> = {
  assets: "SITE,ZONE,BLDG,FLOOR,ROOM,Asset Group,ASSET NUMBER,Asset Description,Additional description,Parent Asset,Department,Remarks\n",
  departments: "code,name,siteLocation,description\n",
  employees: "name,email,companyId,nationalityType,departmentCode,siteLocation\n",
  teams: "name,companyIdNumber,departmentCode,service,email,phone\n",
  services: "departmentName,departmentCode,teamCode\n",
  inventory: "sku,name,category,unit,onHand,reorderPoint,unitCost,vendor,location\n",
  requests: "ticketNo,title,category,requester,channel,priority,status,location,slaHours,description\n",
  workOrders: "woNo,title,type,priority,status,assetTag,dueHours,estimatedHours,cost,jobPlan,safetyNotes\n",
  inspections: "code,title,area,inspector,risk,score,status,dueAt,findings\n",
};

export async function GET(_request: Request, { params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const body = templates[type] ?? templates.assets;
  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${type}-template.csv"`,
    },
  });
}
