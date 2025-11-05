import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateTicketTypeDto } from './dto/create-ticket.dto';
import { UpdateTicketTypeDto } from './dto/edit-ticket.dto';

@Injectable()
export class TicketService {
  constructor(private readonly prisma: PrismaService) {}

  async createTicketType(eventId: string, dto: CreateTicketTypeDto) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event || event.deletedAt) {
      throw new NotFoundException({
        message: 'Cannot create ticket type. Event not found or deleted.',
        error: 'EVENT_NOT_FOUND',
        statusCode: 'E0404',
      });
    }

    if (dto.totalQuantity <= 0) {
      throw new BadRequestException({
        message: 'Total quantity must be greater than 0.',
        error: 'INVALID_QUANTITY',
        statusCode: 'E1008',
      });
    }

    const existingTicket = await this.prisma.ticketType.findFirst({
      where: {
        eventId,
        name: dto.name.toLowerCase().trim(),
        deletedAt: null,
      },
    });

    if (existingTicket) {
      throw new BadRequestException({
        message: 'A ticket type with this name already exists for the event.',
        error: 'TICKET_DUPLICATE',
        statusCode: 'E1009',
      });
    }

    const ticket = await this.prisma.ticketType.create({
      data: {
        eventId,
        name: dto.name.toLowerCase().trim(),
        price: new Prisma.Decimal(dto.price),
        totalQuantity: dto.totalQuantity,
        quantityAvailable: dto.totalQuantity,
      },
    });

    return ticket;
  }

  async getTicketsByEvent(eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event || event.deletedAt) {
      throw new NotFoundException({
        message: 'Event not found or has been deleted.',
        error: 'EVENT_NOT_FOUND',
        statusCode: 'E0404',
      });
    }

    const tickets = await this.prisma.ticketType.findMany({
      where: {
        eventId,
        deletedAt: null,
      },
    });

    return tickets;
  }

  async getTicketById(ticketId: string) {
    const ticket = await this.prisma.ticketType.findUnique({
      where: { id: ticketId },
    });

    if (!ticket || ticket.deletedAt) {
      throw new NotFoundException({
        message: 'Ticket type not found or deleted.',
        error: 'TICKET_NOT_FOUND',
        statusCode: 'E0410',
      });
    }

    return ticket;
  }

  async updateTicketType(ticketId: string, dto: UpdateTicketTypeDto) {
    const ticket = await this.prisma.ticketType.findUnique({
      where: { id: ticketId },
    });

    if (!ticket || ticket.deletedAt) {
      throw new NotFoundException({
        message: 'Cannot update. Ticket type not found or deleted.',
        error: 'TICKET_NOT_FOUND',
        statusCode: 'E0411',
      });
    }

    if (
      dto.totalQuantity &&
      dto.totalQuantity < ticket.totalQuantity - ticket.quantityAvailable
    ) {
      throw new BadRequestException({
        message:
          'New total quantity cannot be less than the number of tickets already sold.',
        error: 'INVALID_TOTAL_QUANTITY',
        statusCode: 'E1010',
      });
    }

    const updated = await this.prisma.ticketType.update({
      where: { id: ticketId },
      data: {
        name: dto.name?.toLowerCase().trim() ?? ticket.name,
        price: dto.price ? new Prisma.Decimal(dto.price) : ticket.price,
        totalQuantity: dto.totalQuantity ?? ticket.totalQuantity,
        quantityAvailable:
          dto.totalQuantity != null
            ? dto.totalQuantity -
              (ticket.totalQuantity - ticket.quantityAvailable)
            : ticket.quantityAvailable,
      },
    });

    return updated;
  }

  async deleteTicketType(ticketId: string) {
    const ticket = await this.prisma.ticketType.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException({
        message: 'Ticket type not found.',
        error: 'TICKET_NOT_FOUND',
        statusCode: 'E0412',
      });
    }

    if (ticket.deletedAt) {
      throw new BadRequestException({
        message: 'Ticket type already deleted.',
        error: 'TICKET_ALREADY_DELETED',
        statusCode: 'E1011',
      });
    }

    await this.prisma.ticketType.update({
      where: { id: ticketId },
      data: {
        deletedAt: new Date(),
      },
    });

    return { message: `Ticket type deleted successfully` };
  }

  async restoreTicketType(ticketId: string) {
    const ticket = await this.prisma.ticketType.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException({
        message: 'Ticket type not found.',
        error: 'TICKET_NOT_FOUND',
        statusCode: 'E0412',
      });
    }

    await this.prisma.ticketType.update({
      where: { id: ticketId },
      data: {
        deletedAt: null,
      },
    });

    return { message: `Ticket type restored successfully` };
  }
}
