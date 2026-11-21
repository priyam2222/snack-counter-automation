export type RefillRequestStatus =
	| "OPEN"
	| "CLAIMED"
	| "PURCHASED"
	| "RECEIPT_SUBMITTED"
	| "COMPLETED"
	| "CANCELLED";

export type RefillRequest = {
	id: string;
	officeId: string;
	reportedBy: string;
	description: string;
	status: RefillRequestStatus;
	claimedBy: string | null;
	claimedAt: Date | null;
	createdAt: Date;
};
