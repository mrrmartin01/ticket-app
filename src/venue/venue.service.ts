import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateVenueDto } from './dto/create-venue.dto';
import { EditVenueDto } from './dto/edit-venue.dto';

@Injectable()
export class VenueService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllVenues(limit = 10, cursor?: string) {
    const venues = await this.prisma.venue.findMany({
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: [{ id: 'desc' }],
    });

    const nextCursor =
      venues.length === limit ? venues[venues.length - 1].id : null;

    return {
      data: venues,
      meta: {
        nextCursor,
        hasMore: !!nextCursor,
      },
    };
  }

  async getVenueById(venueId: string) {
    if (!venueId)
      throw new BadRequestException({
        message: 'No venue id provided',
        error: 'PARTIAL_DATA_INPUT',
        statusCode: 'E1001A',
      });

    const venue = await this.prisma.venue.findUnique({
      where: { id: venueId },
    });

    if (!venue)
      throw new BadRequestException({
        message: 'Venue not found',
        error: 'VENUE_NOT_FOUND',
        statusCode: 'V0404',
      });

    return venue;
  }

  async createVenue(dto: CreateVenueDto) {
    if (!dto)
      throw new BadRequestException({
        message: 'You can not summit an empty form',
        error: 'EMPTY_FORM',
        statusCode: 'E1001',
      });

    const venue = await this.prisma.venue.findFirst({
      where: { name: dto.name },
    });

    if (venue)
      throw new BadRequestException({
        message: 'Venue with this name already exists',
        error: 'VENUE_ALREADY_EXISTS',
        statusCode: 'E1003',
      });

    await this.prisma.venue.create({
      data: {
        name: dto.name.toLocaleLowerCase().trim(),
        address: dto.address.toLocaleLowerCase().trim(),
        city: dto.city.toLocaleLowerCase().trim(),
        capacity: dto.capacity,
      },
    });

    return { message: 'Venue created successfully' };
  }

  async editVenue(venueId: string, dto: EditVenueDto) {
    if (!dto)
      throw new BadRequestException({
        message: 'You can not summit an empty form',
        error: 'EMPTY_FORM',
        statusCode: 'E1001',
      });
    if (!venueId)
      throw new BadRequestException({
        message: 'No venue id provided',
        error: 'PARTIAL_DATA_INPUT',
        statusCode: 'E1001A',
      });

    const venue = await this.prisma.venue.findUnique({
      where: { id: venueId },
    });

    if (!venue)
      throw new BadRequestException({
        message: 'Venue not found',
        error: 'VENUE_NOT_FOUND',
        statusCode: 'V0404',
      });

    await this.prisma.venue.update({
      where: { id: venueId },
      data: {
        name: dto.name?.toLocaleLowerCase().trim(),
        address: dto.address?.toLocaleLowerCase().trim(),
        city: dto.city?.toLocaleLowerCase().trim(),
        capacity: dto.capacity,
      },
    });
    return { message: 'Venue edited successfully' };
  }

  async deleteVenue(venueId: string) {
    if (!venueId)
      throw new BadRequestException({
        message: 'No venue id provided',
        error: 'PARTIAL_DATA_INPUT',
        statusCode: 'E1001A',
      });

    const venue = await this.prisma.venue.findUnique({
      where: { id: venueId },
    });

    if (!venue)
      throw new BadRequestException({
        message: 'Venue not found',
        error: 'VENUE_NOT_FOUND',
        statusCode: 'V0404',
      });

    await this.prisma.venue.delete({
      where: { id: venueId },
    });
    return { message: 'Venue deleted successfully' };
  }
}
