-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "gift_wrap" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "gift_wrap_charge" DECIMAL(10,2) NOT NULL DEFAULT 0.00;
