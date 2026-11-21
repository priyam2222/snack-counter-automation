
import {
  RefillRequest,
  RefillRequestStatus
} from "./refill-request.types.js";

const refillRequests: RefillRequest[] = [
  {
    id: "REQ001",
    officeId: "BLR",
    reportedBy: "VOL001",
    description: "Snack counter is running low on snacks",
    status: "OPEN",
    claimedBy: null,
    claimedAt: null,
    createdAt: new Date()
  },
  {
    id: "REQ002",
    officeId: "OSL",
    reportedBy: "VOL003",
    description: "Coffee and snacks need refilling",
    status: "OPEN",
    claimedBy: null,
    claimedAt: null,
    createdAt: new Date()
  }
];

export const getAllRefillRequests = (): RefillRequest[] => {
  return refillRequests;
};

export const getRefillRequestById = (
  id: string
): RefillRequest | undefined => {
  return refillRequests.find((request) => request.id === id);
};

export const getRefillRequestsByOffice = (
  officeId: string
): RefillRequest[] => {
  return refillRequests.filter(
    (request) => request.officeId === officeId
  );
};
