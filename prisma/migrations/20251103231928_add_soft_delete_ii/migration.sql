-- AlterTable
ALTER TABLE "BookingItems" ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Bookings" ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "TicketTypes" ADD COLUMN     "deleted_at" TIMESTAMP(3);
