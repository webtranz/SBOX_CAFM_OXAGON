import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError } from "@/lib/api-response";
import { auditAction } from "@/lib/audit";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const bodySchema = z.record(z.unknown());
const closedBookingStatuses = ["CHECKED_OUT", "REJECTED", "CANCELLED", "NO_SHOW", "TRANSFERRED"];
const approvalSteps = [
  { step: 1, level: "Housing Coordinator Review", next: "Housing Supervisor" },
  { step: 2, level: "Housing Supervisor Approval", next: "Camp Manager" },
  { step: 3, level: "Camp Manager Final Approval", next: "Reception Team" },
  { step: 4, level: "Reception Allocation", next: "" },
];

export async function PATCH(request: Request, { params }: { params: Promise<{ type: string; id: string }> }) {
  try {
    const { type, id } = await params;
    const input = bodySchema.parse(await request.json());
    const user = await getCurrentUser();
    const record = await updateHousingRecord(type, id, input, user);
    await auditAction({ user, action: `HOUSING_${type.toUpperCase()}_UPDATE`, entity: `housing_${type}`, entityId: id, details: String(input.status || input.remarks || input.notes || "") });
    return NextResponse.json(record);
  } catch (error) {
    return apiError(error, "Unable to update housing record");
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ type: string; id: string }> }) {
  try {
    const { type, id } = await params;
    const user = await getCurrentUser();
    await deleteHousingRecord(type, id);
    await auditAction({ user, action: `HOUSING_${type.toUpperCase()}_DELETE`, entity: `housing_${type}`, entityId: id });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiError(error, "Unable to delete housing record");
  }
}

async function updateHousingRecord(type: string, id: string, input: Record<string, unknown>, user: Awaited<ReturnType<typeof getCurrentUser>>) {
  const actor = user?.name || user?.email || "System";
  if (type === "booking") {
    const status = text(input.status);
    const current = await prisma.housingBooking.findUnique({ where: { id }, include: { bed: true, room: true } });
    if (!current) throw new Error("Booking not found.");
    if (status === "CHECKED_IN") {
      const role = String(user?.role || "").toLowerCase();
      if (!role.includes("reception") && role !== "admin") throw new Error("Only Reception Team can execute final room allocation.");
      if (current.status !== "APPROVED") throw new Error("Room allocation can be executed only after Camp Manager final approval.");
    }
    const nextRoomId = text(input.roomId) || current.roomId;
    const nextRoom = nextRoomId !== current.roomId ? await prisma.housingRoom.findUnique({ where: { id: nextRoomId } }) : current.room;
    if (!nextRoom) throw new Error("Selected room does not exist.");
    if (["CHECKED_IN", "APPROVED", "PENDING_APPROVAL"].includes(status || current.status) && ["BLOCKED", "MAINTENANCE"].includes(nextRoom.status)) {
      throw new Error("Blocked or under-maintenance rooms cannot be allocated.");
    }
    const nextBedId = text(input.bedId) || current.bedId || undefined;
    const nextBed = nextBedId ? await prisma.housingBed.findUnique({ where: { id: nextBedId } }) : null;
    if (nextBed && nextBed.roomId !== nextRoom.id) throw new Error("Selected bed does not belong to the selected room.");
    if (nextBed && nextBed.id !== current.bedId && ["RESERVED", "OCCUPIED"].includes(nextBed.status)) throw new Error("Occupied beds cannot be assigned twice.");
    const booking = await prisma.housingBooking.update({
      where: { id },
      data: {
        status: (status || undefined) as any,
        roomId: nextRoom.id,
        bedId: nextBed?.id || current.bedId,
        approvedBy: text(input.approvedBy) || undefined,
        notes: text(input.notes) || undefined,
        attachmentUrls: text(input.attachmentUrls) || undefined,
        checkOut: input.checkOut ? new Date(String(input.checkOut)) : undefined,
        employeeId: text(input.employeeId) || undefined,
        companyName: text(input.companyName) || undefined,
        nationality: text(input.nationality) || undefined,
        contactNumber: text(input.contactNumber) || undefined,
        gender: text(input.gender) || undefined,
        buildingNumber: text(input.buildingNumber) || undefined,
        floorNumber: text(input.floorNumber) || undefined,
        roomNumber: text(input.roomNumber) || nextRoom.roomNumber,
        bedNumber: text(input.bedNumber) || nextBed?.label || undefined,
        bookingType: text(input.bookingType) || undefined,
        allocationType: text(input.allocationType) || undefined,
        keyHandoverBy: text(input.keyHandoverBy) || undefined,
        keyHandoverAt: input.keyHandoverAt ? new Date(String(input.keyHandoverAt)) : undefined,
        campIdNumber: text(input.campIdNumber) || undefined,
        campIdIssuedAt: input.campIdIssuedAt ? new Date(String(input.campIdIssuedAt)) : undefined,
        cancellationReason: text(input.cancellationReason) || undefined,
        transferReason: text(input.transferReason) || undefined,
        blacklistReason: text(input.blacklistReason) || undefined,
        noShowAt: status === "NO_SHOW" ? new Date() : input.noShowAt ? new Date(String(input.noShowAt)) : undefined,
      },
      include: { bed: true, room: true },
    });
    if (current.bedId && current.bedId !== booking.bedId) {
      await prisma.housingBed.update({ where: { id: current.bedId }, data: { status: "AVAILABLE", occupant: "", occupantId: "" } });
      await refreshRoomOccupancy(current.roomId);
    }
    if (booking.bedId) {
      await prisma.housingBed.update({
        where: { id: booking.bedId },
        data: {
          status: status === "CHECKED_IN" ? "OCCUPIED" : closedBookingStatuses.includes(status) ? "AVAILABLE" : status === "APPROVED" ? "RESERVED" : undefined,
          occupant: closedBookingStatuses.includes(status) ? "" : booking.residentName,
          occupantId: closedBookingStatuses.includes(status) ? "" : booking.residentId || "",
        },
      });
    }
    await refreshRoomOccupancy(booking.roomId);
    await prisma.housingHistory.create({ data: { entity: "booking", entityId: id, bookingId: id, roomId: booking.roomId, actor, action: `Booking ${status || "updated"}`, details: text(input.notes) || text(input.remarks) || "" } });
    return booking;
  }

  if (type === "room") {
    const room = await prisma.housingRoom.update({
      where: { id },
      data: {
        roomNumber: text(input.roomNumber) || undefined,
        floor: text(input.floor) || undefined,
        roomType: text(input.roomType) || undefined,
        genderRestriction: text(input.genderRestriction) || undefined,
        capacity: numberValue(input.capacity),
        status: text(input.status) as any,
        remarks: text(input.remarks) || text(input.notes) || undefined,
      },
    });
    await prisma.housingHistory.create({ data: { entity: "room", entityId: id, roomId: id, actor, action: "Room updated", details: text(input.remarks) || "" } });
    return room;
  }

  if (type === "inspection") {
    const inspection = await prisma.housingInspection.update({
      where: { id },
      data: {
        status: text(input.status) as any,
        score: numberValue(input.score),
        findings: text(input.findings) || text(input.notes) || undefined,
        photoUrls: text(input.photoUrls) || text(input.attachmentUrls) || undefined,
        completedAt: input.completedAt ? new Date(String(input.completedAt)) : text(input.status) === "CLOSED" || text(input.status) === "PASSED" ? new Date() : undefined,
      },
    });
    await prisma.housingHistory.create({ data: { entity: "inspection", entityId: id, inspectionId: id, roomId: inspection.roomId, actor, action: `Inspection ${inspection.status}`, details: inspection.findings || "" } });
    return inspection;
  }

  if (type === "asset") {
    const asset = await prisma.housingAsset.update({
      where: { id },
      data: {
        name: text(input.name) || undefined,
        category: text(input.category) || undefined,
        status: text(input.status) || undefined,
        roomId: text(input.roomId) || undefined,
        serialNumber: text(input.serialNumber) || undefined,
        warrantyExpiry: input.warrantyExpiry ? new Date(String(input.warrantyExpiry)) : undefined,
        photoUrls: text(input.photoUrls) || text(input.attachmentUrls) || undefined,
      },
    });
    await prisma.housingHistory.create({ data: { entity: "asset", entityId: id, assetId: id, roomId: asset.roomId, actor, action: "Asset updated", details: asset.name } });
    return asset;
  }

  if (type === "inventory") {
    const item = await prisma.housingInventory.update({
      where: { id },
      data: {
        name: text(input.name) || undefined,
        category: text(input.category) || undefined,
        roomId: text(input.roomId) || undefined,
        onHand: numberValue(input.onHand),
        reorderPoint: numberValue(input.reorderPoint),
        unit: text(input.unit) || undefined,
      },
    });
    await prisma.housingHistory.create({ data: { entity: "inventory", entityId: id, inventoryId: id, roomId: item.roomId, actor, action: "Inventory updated", details: item.name } });
    return item;
  }

  if (type === "approval") {
    return updateHousingApproval(id, input, user);
  }

  if (type === "notification") {
    return prisma.housingNotification.update({ where: { id }, data: { read: Boolean(input.read) } });
  }

  throw new Error(`Unsupported housing record type: ${type}`);
}

async function updateHousingApproval(id: string, input: Record<string, unknown>, user: Awaited<ReturnType<typeof getCurrentUser>>) {
  const actor = user?.name || user?.email || "System";
  const action = (text(input.action) || text(input.status) || "APPROVED").toUpperCase();
  const remarks = text(input.remarks) || text(input.notes) || text(input.comment);
  if (!["APPROVED", "REJECTED", "RETURNED"].includes(action)) throw new Error("Approval action must be approve, reject, or return for correction.");
  const approval = await prisma.housingApproval.findUnique({ where: { id }, include: { booking: true } });
  if (!approval || !approval.bookingId || !approval.booking) throw new Error("Approval record not found.");
  if (approval.status !== "PENDING") throw new Error("Only the current pending approval can be actioned.");
  if (!canActApproval(user?.role || "", approval.level)) throw new Error(`Only ${approval.level} approvers can action this step.`);

  const nextStep = approvalSteps.find((step) => step.step === approval.step + 1);
  const nextStatus = action === "APPROVED" ? "APPROVED" : action === "REJECTED" ? "REJECTED" : "RETURNED";
  const updated = await prisma.$transaction(async (tx) => {
    const currentApproval = await tx.housingApproval.update({
      where: { id },
      data: { status: nextStatus as any, action, remarks, approverName: actor, actedAt: new Date(), approver: actor },
    });
    if (action === "REJECTED") {
      await tx.housingBooking.update({ where: { id: approval.bookingId! }, data: { status: "REJECTED", approvalLevel: approval.level, approvedBy: actor, notes: remarks || approval.booking?.notes || "" } });
      await tx.housingNotification.create({ data: { title: "Housing booking rejected", message: `${approval.booking?.bookingNo} was rejected at ${approval.level}.`, recipient: approval.booking?.requestedBy || "Requester", severity: "HIGH", bookingId: approval.bookingId } });
    } else if (action === "RETURNED") {
      await tx.housingBooking.update({ where: { id: approval.bookingId! }, data: { status: "REQUESTED", approvalLevel: "Requester Correction", notes: remarks || approval.booking?.notes || "" } });
      await tx.housingNotification.create({ data: { title: "Housing booking returned for correction", message: `${approval.booking?.bookingNo} requires correction: ${remarks || "No remarks provided"}.`, recipient: approval.booking?.requestedBy || "Requester", severity: "MEDIUM", bookingId: approval.bookingId } });
    } else if (nextStep) {
      await tx.housingApproval.updateMany({ where: { bookingId: approval.bookingId, step: nextStep.step, status: "WAITING" as any }, data: { status: "PENDING" as any } });
      await tx.housingBooking.update({ where: { id: approval.bookingId! }, data: { status: "PENDING_APPROVAL", approvalLevel: nextStep.level, approvedBy: actor } });
      await tx.housingNotification.create({ data: { title: "Housing booking pending approval", message: `${approval.booking?.bookingNo} is waiting for ${nextStep.level}.`, recipient: nextStep.next || nextStep.level, severity: approval.booking?.priority || "MEDIUM", bookingId: approval.bookingId } });
    } else {
      await tx.housingBooking.update({ where: { id: approval.bookingId! }, data: { status: "APPROVED", approvalLevel: "Reception Allocation", approvedBy: actor } });
      await tx.housingNotification.create({ data: { title: "Housing booking ready for reception allocation", message: `${approval.booking?.bookingNo} has final approval. Reception can check in and hand over room key.`, recipient: "Reception Team", severity: approval.booking?.priority || "MEDIUM", bookingId: approval.bookingId } });
    }
    await tx.housingHistory.create({ data: { entity: "approval", entityId: currentApproval.id, bookingId: approval.bookingId, roomId: approval.booking?.roomId, actor, action: `${approval.level} ${action}`, details: remarks } });
    return currentApproval;
  });
  return updated;
}

function canActApproval(role: string, level: string) {
  const lowerRole = role.toLowerCase();
  const lowerLevel = level.toLowerCase();
  if (lowerRole === "admin" || lowerRole.includes("super admin")) return true;
  if (lowerLevel.includes("coordinator")) return lowerRole.includes("coordinator") || lowerRole.includes("housing");
  if (lowerLevel.includes("supervisor")) return lowerRole.includes("supervisor");
  if (lowerLevel.includes("camp manager")) return lowerRole.includes("camp") || lowerRole.includes("manager");
  if (lowerLevel.includes("reception")) return lowerRole.includes("reception");
  return false;
}

async function deleteHousingRecord(type: string, id: string) {
  if (type === "booking") {
    const booking = await prisma.housingBooking.delete({ where: { id } });
    if (booking.bedId) await prisma.housingBed.update({ where: { id: booking.bedId }, data: { status: "AVAILABLE", occupant: "", occupantId: "" } });
    await refreshRoomOccupancy(booking.roomId);
    return;
  }
  if (type === "room") return void await prisma.housingRoom.delete({ where: { id } });
  if (type === "inspection") return void await prisma.housingInspection.delete({ where: { id } });
  if (type === "asset") return void await prisma.housingAsset.delete({ where: { id } });
  if (type === "inventory") return void await prisma.housingInventory.delete({ where: { id } });
  if (type === "approval") return void await prisma.housingApproval.delete({ where: { id } });
  if (type === "notification") return void await prisma.housingNotification.delete({ where: { id } });
  if (type === "property") return void await prisma.housingProperty.delete({ where: { id } });
  if (type === "block") return void await prisma.housingBlock.delete({ where: { id } });
  throw new Error(`Unsupported housing record type: ${type}`);
}

async function refreshRoomOccupancy(roomId: string) {
  const room = await prisma.housingRoom.findUnique({ where: { id: roomId } });
  if (!room) return;
  const occupancy = await prisma.housingBed.count({ where: { roomId, status: { in: ["RESERVED", "OCCUPIED"] as any } } });
  const status = room.status === "MAINTENANCE" || room.status === "BLOCKED" ? room.status : occupancy >= room.capacity ? "OCCUPIED" : occupancy > 0 ? "RESERVED" : "AVAILABLE";
  await prisma.housingRoom.update({ where: { id: roomId }, data: { occupancy, status } });
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function numberValue(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}
