/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Events` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updated_at` to the `Events` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "EventStatus" ADD VALUE 'IN_PROGRESS';
ALTER TYPE "EventStatus" ADD VALUE 'COMPLETED';

-- DropIndex
DROP INDEX "public"."Events_venue_id_idx";

-- AlterTable
ALTER TABLE "Events" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'SCHEDULED';

-- CreateIndex
CREATE UNIQUE INDEX "Events_name_key" ON "Events"("name");

-- CreateIndex
CREATE INDEX "Events_venue_id_name_date_time_idx" ON "Events"("venue_id", "name", "date_time");
