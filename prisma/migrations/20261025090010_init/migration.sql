-- CreateEnum
CREATE TYPE "FoodKind" AS ENUM ('homemade', 'packaged');

-- CreateTable
CREATE TABLE "foods" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "kind" "FoodKind" NOT NULL,
    "barcode" TEXT,
    "serving_label" TEXT NOT NULL,
    "calories" DOUBLE PRECISION NOT NULL,
    "protein_g" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "carbs_g" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fat_g" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "foods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "log_entries" (
    "id" SERIAL NOT NULL,
    "food_id" INTEGER,
    "eaten_on" DATE NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "food_name" TEXT NOT NULL,
    "serving_label" TEXT NOT NULL,
    "calories" DOUBLE PRECISION NOT NULL,
    "protein_g" DOUBLE PRECISION NOT NULL,
    "carbs_g" DOUBLE PRECISION NOT NULL,
    "fat_g" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "log_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "log_entries_eaten_on_idx" ON "log_entries"("eaten_on");

-- AddForeignKey
ALTER TABLE "log_entries" ADD CONSTRAINT "log_entries_food_id_fkey" FOREIGN KEY ("food_id") REFERENCES "foods"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Data integrity checks Prisma's schema language can't express.
ALTER TABLE "foods"
  ADD CONSTRAINT "foods_nonnegative_nutrition"
  CHECK ("calories" >= 0 AND "protein_g" >= 0 AND "carbs_g" >= 0 AND "fat_g" >= 0);

ALTER TABLE "log_entries"
  ADD CONSTRAINT "log_entries_positive_quantity" CHECK ("quantity" > 0);
