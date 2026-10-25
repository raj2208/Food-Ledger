-- CreateEnum
CREATE TYPE "MealType" AS ENUM ('breakfast', 'lunch', 'dinner');

-- AlterTable
ALTER TABLE "log_entries" ADD COLUMN     "meal" "MealType";
