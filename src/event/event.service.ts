import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Event, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { EditEventDto } from './dto/edit-event.dto';

@Injectable()
export class EventService {
  constructor(private readonly prisma: PrismaService) {}

  private calculateEventStatus(
    dateTime: Date,
    durationMinutes: number,
  ): Promise<'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'> {
    const now = new Date();
    const endTime = new Date(dateTime.getTime() + durationMinutes * 60000);

    if (now < dateTime) {
      return Promise.resolve('SCHEDULED');
    } else if (now >= dateTime && now <= endTime) {
      return Promise.resolve('IN_PROGRESS');
    } else {
      return Promise.resolve('COMPLETED');
    }
  }

  private async updateEventStatus(event: Event): Promise<Event> {
    if (event.status === 'CANCELLED') {
      return event; // Don't update cancelled events
    }

    const newStatus = await this.calculateEventStatus(
      event.dateTime,
      event.durationMinutes,
    );

    if (newStatus !== event.status) {
      return await this.prisma.event.update({
        where: { id: event.id },
        data: { status: newStatus },
      });
    }

    return event;
  }

  async getAllEvents(
    limit = 10,
    cursor?: string,
  ): Promise<{
    data: Event[];
    meta: { nextCursor: string | null; hasMore: boolean };
  }> {
    const events = await this.prisma.event.findMany({
      where: { deletedAt: null },
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: [{ id: 'desc' }],
    });

    const updatedEvents = await Promise.all(
      events.map((event) => this.updateEventStatus(event)),
    );

    const nextCursor =
      updatedEvents.length === limit
        ? updatedEvents[updatedEvents.length - 1].id
        : null;

    return {
      data: updatedEvents,
      meta: {
        nextCursor,
        hasMore: !!nextCursor,
      },
    };
  }

  async getEventById(eventId: string): Promise<Event> {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId, deletedAt: null },
    });
    if (!event)
      throw new NotFoundException({
        message: 'Event not found',
        error: 'EVENT_NOT_FOUND',
        statusCode: 'E0404',
      });

    return await this.updateEventStatus(event);
  }

  async getEventsByVenue(
    venueId: string,
    limit = 10,
    cursor?: string,
  ): Promise<{
    data: Event[];
    meta: { nextCursor: string | null; hasMore: boolean };
  }> {
    const events = await this.prisma.event.findMany({
      where: { venueId, deletedAt: null },
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: [{ dateTime: 'asc' }],
    });

    const updatedEvents = await Promise.all(
      events.map((event) => this.updateEventStatus(event)),
    );

    const nextCursor =
      updatedEvents.length === limit
        ? updatedEvents[updatedEvents.length - 1].id
        : null;

    return {
      data: updatedEvents,
      meta: {
        nextCursor,
        hasMore: !!nextCursor,
      },
    };
  }

  async createEvent(dto: CreateEventDto, userId: string): Promise<Event> {
    if (!userId)
      throw new BadRequestException({
        message: 'User ID is required to create an event',
        error: 'USER_ID_MISSING',
        statusCode: 'E1004',
      });

    if (!dto || Object.keys(dto).length === 0)
      throw new BadRequestException({
        message: 'You cannot submit an empty form',
        error: 'EMPTY_FORM',
        statusCode: 'E1001',
      });

    const name = dto.name?.toLowerCase().trim();
    const description = dto.description?.trim();
    const dateTime =
      (dto.dateTime as any) instanceof Date
        ? (dto.dateTime as unknown as Date)
        : // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          new Date(dto.dateTime as any);

    if (isNaN(dateTime.getTime())) {
      throw new BadRequestException({
        message:
          'Invalid dateTime format — must be a valid ISO date string or Date object.',
        error: 'INVALID_DATETIME',
        statusCode: 'E1002',
      });
    }

    if (!dto.durationMinutes || dto.durationMinutes <= 0) {
      throw new BadRequestException({
        message: 'Duration must be a positive number of minutes.',
        error: 'INVALID_DURATION',
        statusCode: 'E1006',
      });
    }

    // Calculate event time window
    const startTime = dateTime;
    const endTime = new Date(startTime.getTime() + dto.durationMinutes * 60000);

    // Check for time overlap at same venue
    const conflictingEvent = await this.prisma.event.findFirst({
      where: {
        deletedAt: null,
        AND: [
          { venueId: dto.venueId },
          { name },
          {
            OR: [
              // Overlap condition: existing.start < new.end && existing.end > new.start
              {
                AND: [
                  { dateTime: { lt: endTime } },
                  {
                    dateTime: {
                      gt: new Date(
                        startTime.getTime() - dto.durationMinutes * 60000,
                      ),
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    });

    if (conflictingEvent) {
      throw new BadRequestException({
        message: 'An event with this name at the same venue overlaps in time.',
        error: 'EVENT_CONFLICT',
        statusCode: 'E1003',
      });
    }

    // Build payload safely
    const eventData: Prisma.EventCreateInput = {
      venue: { connect: { id: dto.venueId } },
      name,
      description,
      dateTime: startTime,
      durationMinutes: dto.durationMinutes,
    };

    const newEvent = await this.prisma.event.create({
      data: eventData,
    });

    return newEvent;
  }

  async editEvent(
    eventId: string,
    dto: EditEventDto,
    userId: string,
  ): Promise<{ message: string }> {
    if (!eventId)
      throw new NotFoundException({
        message: 'Event not found',
        error: 'EVENT_NOT_FOUND',
        statusCode: 'E0404',
      });

    if (!userId)
      throw new BadRequestException({
        message: 'User ID is required to edit an event',
        error: 'USER_ID_MISSING',
        statusCode: 'E1004',
      });

    if (!dto || Object.keys(dto).length === 0)
      throw new BadRequestException({
        message: 'You cannot submit an empty form',
        error: 'EMPTY_FORM',
        statusCode: 'E1001',
      });

    // Normalize incoming values
    const name = dto.name?.toLowerCase().trim();
    const description = dto.description?.trim();
    const dateTime = dto.dateTime ? new Date(dto.dateTime) : undefined;

    // Fetch the current event to compute updated time window
    const existingEvent = await this.prisma.event.findUnique({
      where: { id: eventId, deletedAt: null },
    });

    if (!existingEvent) {
      throw new NotFoundException({
        message: 'Event not found',
        error: 'EVENT_NOT_FOUND',
        statusCode: 'E0404',
      });
    }

    // Derive effective time window (fall back to current values)
    const startTime = dateTime ?? existingEvent.dateTime;
    const duration = dto.durationMinutes ?? existingEvent.durationMinutes;
    const endTime = new Date(startTime.getTime() + duration * 60000);

    // Conflict detection — robust overlap logic
    const conflictingEvent = await this.prisma.event.findFirst({
      where: {
        AND: [
          { id: { not: eventId } },
          { venueId: dto.venueId ?? existingEvent.venueId },
          name ? { name } : {},
          {
            // Overlap condition: (A starts before B ends) && (A ends after B starts)
            dateTime: { lte: endTime },
            NOT: {
              dateTime: {
                lte: new Date(startTime.getTime() - duration * 60000),
              },
            },
          },
        ],
      },
    });

    if (conflictingEvent) {
      throw new BadRequestException({
        message:
          'This event conflicts with another event at the same venue and time.',
        error: 'EVENT_CONFLICT',
        statusCode: 'E1005',
      });
    }

    // Build update payload safely
    const updateData = Object.fromEntries(
      Object.entries({
        venueId: dto.venueId,
        name,
        description,
        dateTime,
        durationMinutes: dto.durationMinutes,
      }).filter(([, v]) => v !== undefined),
    );

    await this.prisma.event.update({
      where: { id: eventId },
      data: updateData,
    });

    return { message: 'Event updated successfully' };
  }

  async deleteEvent(
    eventId: string,
    userId: string,
  ): Promise<{ message: string }> {
    if (!userId)
      throw new BadRequestException({
        message: 'User ID is required to delete an event',
        error: 'USER_ID_MISSING',
        statusCode: 'E1004',
      });

    const existingEvent = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!existingEvent) {
      throw new NotFoundException({
        message: 'Event not found',
        error: 'EVENT_NOT_FOUND',
        statusCode: 'E0404',
      });
    }

    if (existingEvent.deletedAt) {
      throw new BadRequestException({
        message: 'Event has already been deleted',
        error: 'EVENT_ALREADY_DELETED',
        statusCode: 'E1007',
      });
    }

    await this.prisma.event.update({
      where: { id: eventId },
      data: {
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    await this.prisma.ticketType.updateMany({
      where: { eventId },
      data: { deletedAt: new Date() },
    });

    return { message: `Event deleted successfully by user` };
  }

  async restoreEvent(eventId: string): Promise<{ message: string }> {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException({
        message: 'Event not found',
        error: 'EVENT_NOT_FOUND',
        statusCode: 'E0404',
      });
    }

    if (!event.deletedAt) {
      throw new BadRequestException({
        message: 'Event is not deleted',
        error: 'EVENT_NOT_DELETED',
        statusCode: 'E1009',
      });
    }

    await this.prisma.event.update({
      where: { id: eventId },
      data: { deletedAt: null },
    });

    return { message: `Event restored successfully by user` };
  }
}
