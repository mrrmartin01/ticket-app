import {
  Controller,
  Get,
  Query,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { BookingService } from 'src/booking/booking.service';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('payment')
@ApiTags('Payment Module')
export class PaymentController {
  constructor(private readonly bookingService: BookingService) {}

  @Get('callback')
  async handlePaymentCallback(@Query('reference') reference: string) {
    if (!reference) {
      throw new BadRequestException('Payment reference is required.');
    }

    const isSuccess = await this.bookingService.verifyPayment(reference);
    if (isSuccess) {
      return {
        message: 'Payment verified successfully. Booking confirmed.',
        bookingId: reference,
      };
    } else {
      throw new BadRequestException('Payment verification failed.');
    }
  }
}
