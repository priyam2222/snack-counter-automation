-- AlterTable
ALTER TABLE "RefillRequest" ADD COLUMN     "hrRemarks" TEXT,
ADD COLUMN     "hrStatus" TEXT,
ADD COLUMN     "purchaseAmount" DECIMAL(12,2),
ADD COLUMN     "purchasedAt" TIMESTAMP(3),
ADD COLUMN     "receiptReference" TEXT;
