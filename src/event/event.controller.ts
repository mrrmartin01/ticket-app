import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { EditEventDto } from './dto/edit-event.dto';

@ApiTags('Event Management')
@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get('all')
  async getAllEvents(
    @Param('limit') limit = 10,
    @Param('cursor') cursor?: string,
  ) {
    return this.eventService.getAllEvents(Number(limit), cursor);
  }

  @Get(':id')
  async getEventById(@Param('id') id: string) {
    return this.eventService.getEventById(id);
  }

  @Get('venue/:id')
  async getEventsByVenue(
    @Param('id') venueId: string,
    @Param('limit') limit = 10,
    @Param('cursor') cursor?: string,
  ) {
    return this.eventService.getEventsByVenue(venueId, Number(limit), cursor);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('create')
  async createEvent(
    @Body() dto: CreateEventDto,
    @GetUser('id') userId: string,
  ) {
    return this.eventService.createEvent(dto, userId);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch('edit/:id')
  async editEvent(
    @Param('id') eventId: string,
    @Body() dto: EditEventDto,
    @GetUser('id') userId: string,
  ) {
    return this.eventService.editEvent(eventId, dto, userId);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete('delete/:id')
  async deleteEvent(
    @Param('id') eventId: string,
    @GetUser('id') userId: string,
  ) {
    return this.eventService.deleteEvent(eventId, userId);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch('restore/:id')
  async restoreEvent(@Param('id') eventId: string) {
    return this.eventService.restoreEvent(eventId);
  }
}
