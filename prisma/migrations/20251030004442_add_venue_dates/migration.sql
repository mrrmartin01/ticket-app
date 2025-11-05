/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Venues` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updated_at` to the `Venues` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "PaymentMethod" ADD VALUE 'FREE';

-- AlterTable
ALTER TABLE "Venues" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Venues_name_key" ON "Venues"("name");

-- CreateIndex
CREATE INDEX "Venues_name_venue_id_idx" ON "Venues"("name", "venue_id");
