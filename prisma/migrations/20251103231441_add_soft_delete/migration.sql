-- DropForeignKey
ALTER TABLE "public"."BookingItems" DROP CONSTRAINT "BookingItems_booking_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."BookingItems" DROP CONSTRAINT "BookingItems_ticket_type_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Bookings" DROP CONSTRAINT "Bookings_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Events" DROP CONSTRAINT "Events_venue_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."TicketTypes" DROP CONSTRAINT "TicketTypes_event_id_fkey";

-- AlterTable
ALTER TABLE "Events" ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "Events" ADD CONSTRAINT "Events_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "Venues"("venue_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketTypes" ADD CONSTRAINT "TicketTypes_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Events"("event_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookings" ADD CONSTRAINT "Bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingItems" ADD CONSTRAINT "BookingItems_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "Bookings"("booking_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingItems" ADD CONSTRAINT "BookingItems_ticket_type_id_fkey" FOREIGN KEY ("ticket_type_id") REFERENCES "TicketTypes"("ticket_type_id") ON DELETE RESTRICT ON UPDATE CASCADE;
