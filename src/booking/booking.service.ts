import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaymentService } from 'src/payment/payment.service';
import { Prisma, BookingStatus } from '@prisma/client';
import { CreateBookingDto } from './dto/create-booking.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BookingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentService: PaymentService,
    private readonly config: ConfigService,
  ) {}

  async createBooking(dto: CreateBookingDto, userId: string) {
    if (!userId) {
      throw new BadRequestException({
        message: 'User ID is required to create a booking.',
        error: 'USER_ID_MISSING',
      });
    }

    // Fetch ticket types
    const ticketIds = dto.items.map((item) => item.ticketTypeId);
    const tickets = await this.prisma.ticketType.findMany({
      where: {
        id: { in: ticketIds },
        deletedAt: null,
      },
    });

    if (tickets.length !== dto.items.length) {
      throw new NotFoundException({
        message: 'One or more ticket types were not found or deleted.',
        error: 'TICKET_NOT_FOUND',
      });
    }

    // Validate ticket availability
    for (const item of dto.items) {
      const ticket = tickets.find((t) => t.id === item.ticketTypeId);
      if (!ticket) {
        throw new NotFoundException({
          message: `Ticket type ${item.ticketTypeId} not found.`,
          error: 'TICKET_NOT_FOUND',
        });
      }
      if (ticket.quantityAvailable < item.quantity) {
        throw new BadRequestException({
          message: `Not enough tickets available for "${ticket.name}".`,
          error: 'INSUFFICIENT_STOCK',
        });
      }
    }

    // Calculate total amount
    const totalAmount = dto.items.reduce((sum, item) => {
      const ticket = tickets.find((t) => t.id === item.ticketTypeId);
      const subtotal = Number(ticket?.price) * item.quantity;
      return sum + subtotal;
    }, 0);

    // Fetch user for email
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true },
    });
    if (!user) {
      throw new NotFoundException({
        message: 'User not found.',
        error: 'USER_NOT_FOUND',
      });
    }

    // Create booking atomically
    const [booking] = await this.prisma.$transaction(async (tx) => {
      const createdBooking = await tx.booking.create({
        data: {
          userId,
          status:
            totalAmount === 0
              ? BookingStatus.CONFIRMED
              : BookingStatus.PENDING_PAYMENT,
          totalAmount: new Prisma.Decimal(totalAmount),
          bookingItems: {
            create: dto.items.map((item) => {
              const ticket = tickets.find((t) => t.id === item.ticketTypeId);
              return {
                ticketType: {
                  connect: { id: item.ticketTypeId },
                },
                quantityBooked: item.quantity,
                unitPrice: ticket!.price,
                subtotal: new Prisma.Decimal(
                  Number(ticket?.price) * item.quantity,
                ),
              };
            }),
          },
        },
        include: {
          bookingItems: true,
        },
      });

      // Update ticket quantities
      for (const item of dto.items) {
        await tx.ticketType.update({
          where: { id: item.ticketTypeId },
          data: {
            quantityAvailable: {
              decrement: item.quantity,
            },
          },
        });
      }

      return [createdBooking];
    });

    // Handle payment if totalAmount > 0
    if (totalAmount > 0) {
      const callbackUrl = this.config.getOrThrow<string>(
        'PAYSTACK_CALLBACK_URL',
      );
      const payment = await this.paymentService.initializePayment(
        booking,
        user.firstName + ' ' + user.lastName,
        callbackUrl,
      );

      await this.prisma.booking.update({
        where: { id: booking.id },
        data: {
          paymentRef: payment.reference,
        },
      });

      return {
        message: 'Booking created. Complete payment to confirm.',
        bookingId: booking.id,
        totalAmount,
        status: BookingStatus.PENDING_PAYMENT,
        paymentUrl: payment.authorization_url,
      };
    }

    return {
      message: 'Booking created successfully.',
      bookingId: booking.id,
      totalAmount,
      status: BookingStatus.CONFIRMED,
    };
  }

  async verifyPayment(bookingId: string): Promise<boolean> {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      select: { paymentRef: true, status: true },
    });

    if (!booking || !booking.paymentRef) {
      throw new NotFoundException('Booking or payment reference not found.');
    }

    if (booking.status !== BookingStatus.PENDING_PAYMENT) {
      throw new BadRequestException('Booking is not awaiting payment.');
    }

    const isPaymentSuccessful = await this.paymentService.verifyPayment(
      booking.paymentRef,
    );

    if (isPaymentSuccessful) {
      await this.prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: BookingStatus.CONFIRMED,
          paymentStatus: 'SUCCESS',
        },
      });
      return true;
    } else {
      await this.prisma.booking.update({
        where: { id: bookingId },
        data: {
          paymentStatus: 'FAILED',
        },
      });
      return false;
    }
  }
}
