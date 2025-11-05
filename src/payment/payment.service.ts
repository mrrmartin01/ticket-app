import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as PaystackUntyped from 'paystack-api';
import { Booking } from '@prisma/client';
import {
  PaystackClient,
  PaystackFactory,
  PaystackInitResponse,
  PaystackVerifyResponse,
} from './types/paystack.interface';

@Injectable()
export class PaymentService {
  private readonly paystack: PaystackClient;

  constructor(private readonly configService: ConfigService) {
    const secret = this.configService.getOrThrow<string>('PAYSTACK_SECRET_KEY');
    const Paystack = PaystackUntyped as unknown as PaystackFactory;
    this.paystack = Paystack(secret);
  }

  async initializePayment(
    booking: Booking,
    userName: string,
    callbackUrl: string,
  ): Promise<{ authorization_url: string; reference: string }> {
    try {
      const response: PaystackInitResponse =
        await this.paystack.transaction.initialize({
          name: userName,
          amount: Math.round(Number(booking.totalAmount) * 100),
          reference: booking.id,
          callback_url: callbackUrl,
        });

      if (!response.status || !response.data.authorization_url) {
        throw new InternalServerErrorException(
          `Invalid Paystack response: ${response.message}`,
        );
      }

      return {
        authorization_url: response.data.authorization_url,
        reference: response.data.reference,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : JSON.stringify(err);
      throw new InternalServerErrorException(
        `Failed to initialize payment: ${message}`,
      );
    }
  }

  async verifyPayment(reference: string): Promise<boolean> {
    try {
      const response: PaystackVerifyResponse =
        await this.paystack.transaction.verify({ reference });

      if (!response.status) {
        throw new InternalServerErrorException(response.message);
      }

      return response.data.status === 'success';
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : JSON.stringify(err);
      throw new InternalServerErrorException(
        `Payment verification failed: ${message}`,
      );
    }
  }
}
