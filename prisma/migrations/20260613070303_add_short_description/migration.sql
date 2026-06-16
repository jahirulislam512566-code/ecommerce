-- AlterTable
ALTER TABLE "product_variants" ADD COLUMN     "comparePrice" DECIMAL(10,2),
ADD COLUMN     "name" TEXT;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "shortDescription" TEXT;

-- CreateIndex
CREATE INDEX "products_featured_idx" ON "products"("featured");
