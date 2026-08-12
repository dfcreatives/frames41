-- AlterEnum
ALTER TYPE "BannerType" ADD VALUE 'TRENDING';

-- DropIndex
DROP INDEX "orders_user_placed_at_idx";

-- DropIndex
DROP INDEX "products_description_trgm_idx";

-- DropIndex
DROP INDEX "products_name_trgm_idx";

-- DropIndex
DROP INDEX "products_short_description_trgm_idx";

-- DropIndex
DROP INDEX "reviews_product_approved_created_at_idx";

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "is_trending" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "trending_banner_url" TEXT;

-- CreateIndex
CREATE INDEX "orders_user_id_placed_at_idx" ON "orders"("user_id", "placed_at");

-- CreateIndex
CREATE INDEX "reviews_product_id_is_approved_created_at_idx" ON "reviews"("product_id", "is_approved", "created_at");
