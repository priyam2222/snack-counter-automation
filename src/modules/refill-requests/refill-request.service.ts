
import { prisma } from "../../config/prisma.js";

export async function getAllRefillRequests() {
  return prisma.refillRequest.findMany({
    include: { office: true, reporter: true, claimant: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getRefillRequestById(id: string) {
  return prisma.refillRequest.findUnique({
    where: { id },
    include: { office: true, reporter: true, claimant: true },
  });
}

export async function getRefillRequestsByOffice(officeId: string) {
  return prisma.refillRequest.findMany({
    where: { officeId },
    include: { office: true, reporter: true, claimant: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function createRefillRequest(
  officeId: string,
  reportedBy: string,
  description: string,
) {
  const volunteer = await prisma.volunteer.findUnique({
    where: { id: reportedBy },
  });

  if (!volunteer || !volunteer.isActive || volunteer.officeId !== officeId) {
    throw new Error("INVALID_REPORTER");
  }

  return prisma.refillRequest.create({
    data: {
      id: `REQ-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      officeId,
      reportedBy,
      description,
    },
  });
}

export async function claimRefillRequest(id: string, volunteerId: string) {
  const volunteer = await prisma.volunteer.findUnique({
    where: { id: volunteerId },
  });

  if (!volunteer || !volunteer.isActive) {
    throw new Error("INVALID_VOLUNTEER");
  }

  return prisma.$transaction(async (tx) => {
    const request = await tx.refillRequest.findUnique({ where: { id } });

    if (!request) throw new Error("REQUEST_NOT_FOUND");

    // Automatically reopen expired claims.
    if (
      request.status === "CLAIMED" &&
      request.claimedAt &&
      Date.now() - request.claimedAt.getTime() >= 12 * 60 * 60 * 1000
    ) {
      await tx.refillRequest.updateMany({
        where: {
          id,
          status: "CLAIMED",
          claimedAt: request.claimedAt,
        },
        data: {
          status: "OPEN",
          claimedBy: null,
          claimedAt: null,
        },
      });
    }

    const result = await tx.refillRequest.updateMany({
      where: {
        id,
        officeId: volunteer.officeId,
        status: "OPEN",
        claimedBy: null,
      },
      data: {
        status: "CLAIMED",
        claimedBy: volunteerId,
        claimedAt: new Date(),
      },
    });

    if (result.count === 0) {
      const latest = await tx.refillRequest.findUnique({ where: { id } });

      if (latest?.officeId !== volunteer.officeId) {
        throw new Error("WRONG_OFFICE");
      }

      throw new Error("ALREADY_CLAIMED");
    }

    return tx.refillRequest.findUnique({
      where: { id },
      include: { claimant: true, office: true },
    });
  });
}

export async function submitPurchase(
  id: string,
  volunteerId: string,
  amount: number,
  receiptReference: string,
) {
  if (!Number.isFinite(amount) || amount <= 0 || !receiptReference.trim()) {
    throw new Error("INVALID_PURCHASE");
  }

  const result = await prisma.refillRequest.updateMany({
    where: {
      id,
      claimedBy: volunteerId,
      status: "CLAIMED",
    },
    data: {
      status: "PURCHASED",
      purchasedAt: new Date(),
      purchaseAmount: amount,
      receiptReference: receiptReference.trim(),
    },
  });

  if (!result.count) throw new Error("INVALID_REQUEST_OR_CLAIM");

  return prisma.refillRequest.findUnique({ where: { id } });
}

export async function submitReceipt(id: string, volunteerId: string) {
  const result = await prisma.refillRequest.updateMany({
    where: {
      id,
      claimedBy: volunteerId,
      status: "PURCHASED",
    },
    data: { status: "RECEIPT_SUBMITTED" },
  });

  if (!result.count) throw new Error("INVALID_REQUEST_OR_PURCHASE");

  return prisma.refillRequest.findUnique({ where: { id } });
}

export async function reviewReimbursement(
  id: string,
  approved: boolean,
  remarks: string,
) {
  return prisma.$transaction(async (tx) => {
    const request = await tx.refillRequest.findUnique({ where: { id } });

    if (!request || request.status !== "RECEIPT_SUBMITTED") {
      throw new Error("INVALID_REVIEW_REQUEST");
    }

    return tx.refillRequest.update({
      where: { id },
      data: {
        status: approved ? "COMPLETED" : "CANCELLED",
        hrStatus: approved ? "APPROVED" : "REJECTED",
        hrRemarks: remarks,
      },
    });
  });
}
