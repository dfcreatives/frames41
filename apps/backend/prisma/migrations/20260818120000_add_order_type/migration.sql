-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('DELIVERY', 'PICKUP');

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "type" "OrderType" NOT NULL DEFAULT 'DELIVERY';
