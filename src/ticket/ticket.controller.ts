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
import { TicketService } from './ticket.service';
import { CreateTicketTypeDto } from './dto/create-ticket.dto';
import { UpdateTicketTypeDto } from './dto/edit-ticket.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AdminGuard } from 'src/auth/guards/admin.guard';

@Controller('tickets')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('create/:eventId')
  createTicketType(
    @Param('eventId') eventId: string,
    @Body() dto: CreateTicketTypeDto,
  ) {
    return this.ticketService.createTicketType(eventId, dto);
  }

  @Get('event/:eventId')
  getTicketsByEvent(@Param('eventId') eventId: string) {
    return this.ticketService.getTicketsByEvent(eventId);
  }

  @Get(':id')
  getTicketById(@Param('id') ticketId: string) {
    return this.ticketService.getTicketById(ticketId);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch('edit/:id')
  updateTicketType(
    @Param('id') ticketId: string,
    @Body() dto: UpdateTicketTypeDto,
  ) {
    return this.ticketService.updateTicketType(ticketId, dto);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete('delete/:id')
  deleteTicketType(@Param('id') ticketId: string) {
    return this.ticketService.deleteTicketType(ticketId);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch('restore/:id')
  restoreTicketType(@Param('id') ticketId: string) {
    return this.ticketService.restoreTicketType(ticketId);
  }
}
