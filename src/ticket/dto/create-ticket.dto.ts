import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTicketTypeDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'VIP',
    description: 'Name of the ticket type (e.g., VIP, Regular, Student)',
  })
  name: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  @IsPositive()
  @ApiProperty({
    example: 120.5,
    description: 'Ticket price in the event’s default currency',
  })
  price: number;

  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @ApiProperty({
    example: 100,
    description: 'Total number of tickets available for this type',
  })
  totalQuantity: number;
}
