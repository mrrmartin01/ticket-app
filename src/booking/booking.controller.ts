import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiTags } from '@nestjs/swagger';

@UseGuards(JwtAuthGuard)
@Controller('booking')
@ApiTags('Booking Management')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  async createBooking(
    @Body() dto: CreateBookingDto,
    @GetUser() userId: string,
  ) {
    return this.bookingService.createBooking(dto, userId);
  }

  @Get('verify-payment/:bookingId')
  async verifyPayment(@Param('bookingId') bookingId: string) {
    return this.bookingService.verifyPayment(bookingId);
  }

  // @Get()
  // async getBookings(@GetUser('id') userId: string) {
  //   return this.bookingService.getUserBookings(userId);
  // }
}
