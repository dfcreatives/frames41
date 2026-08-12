-- AlterTable
ALTER TABLE "orders" ADD COLUMN "cod_due_amount" DECIMAL(10,2) NOT NULL DEFAULT 0.00;

-- AlterTable
ALTER TABLE "payments" ADD COLUMN "is_partial" BOOLEAN NOT NULL DEFAULT false;
