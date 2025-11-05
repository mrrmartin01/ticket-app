/*
  Warnings:

  - You are about to drop the column `payment_method` on the `Bookings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Bookings" DROP COLUMN "payment_method";

-- DropEnum
DROP TYPE "public"."PaymentMethod";
