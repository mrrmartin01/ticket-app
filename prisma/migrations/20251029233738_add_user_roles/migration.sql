-- CreateEnum
CREATE TYPE "UserRoles" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('SCHEDULED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('CONFIRMED', 'PENDING_PAYMENT');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CREDIT_CARD', 'DEBIT_CARD', 'PAYPAL', 'BANK_TRANSFER', 'CASH');

-- CreateTable
CREATE TABLE "Users" (
    "user_id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "role" "UserRoles" NOT NULL DEFAULT 'USER',
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Venues" (
    "venue_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,

    CONSTRAINT "Venues_pkey" PRIMARY KEY ("venue_id")
);

-- CreateTable
CREATE TABLE "Events" (
    "event_id" TEXT NOT NULL,
    "venue_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date_time" TIMESTAMP(3) NOT NULL,
    "duration_minutes" INTEGER NOT NULL,
    "status" "EventStatus" NOT NULL,

    CONSTRAINT "Events_pkey" PRIMARY KEY ("event_id")
);

-- CreateTable
CREATE TABLE "TicketTypes" (
    "ticket_type_id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "total_quantity" INTEGER NOT NULL,
    "quantity_available" INTEGER NOT NULL,

    CONSTRAINT "TicketTypes_pkey" PRIMARY KEY ("ticket_type_id")
);

-- CreateTable
CREATE TABLE "Bookings" (
    "booking_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "booking_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total_amount" DECIMAL(10,2) NOT NULL,
    "status" "BookingStatus" NOT NULL,
    "payment_method" "PaymentMethod" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bookings_pkey" PRIMARY KEY ("booking_id")
);

-- CreateTable
CREATE TABLE "BookingItems" (
    "booking_item_id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "ticket_type_id" TEXT NOT NULL,
    "quantity_booked" INTEGER NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "BookingItems_pkey" PRIMARY KEY ("booking_item_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- CreateIndex
CREATE INDEX "Events_venue_id_idx" ON "Events"("venue_id");

-- CreateIndex
CREATE INDEX "TicketTypes_event_id_idx" ON "TicketTypes"("event_id");

-- CreateIndex
CREATE INDEX "Bookings_user_id_idx" ON "Bookings"("user_id");

-- CreateIndex
CREATE INDEX "BookingItems_booking_id_idx" ON "BookingItems"("booking_id");

-- CreateIndex
CREATE INDEX "BookingItems_ticket_type_id_idx" ON "BookingItems"("ticket_type_id");

-- AddForeignKey
ALTER TABLE "Events" ADD CONSTRAINT "Events_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "Venues"("venue_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketTypes" ADD CONSTRAINT "TicketTypes_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Events"("event_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookings" ADD CONSTRAINT "Bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingItems" ADD CONSTRAINT "BookingItems_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "Bookings"("booking_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingItems" ADD CONSTRAINT "BookingItems_ticket_type_id_fkey" FOREIGN KEY ("ticket_type_id") REFERENCES "TicketTypes"("ticket_type_id") ON DELETE CASCADE ON UPDATE CASCADE;
