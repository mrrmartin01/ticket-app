import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { BookingService } from 'src/booking/booking.service';
import { ApiTags } from '@nestjs/swagger';

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
