import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class BookingItemDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'ticket-type-id',
    description: 'ID of the ticket type',
  })
  ticketTypeId: string;

  @IsNumber()
  @IsPositive()
  @ApiProperty({ example: 2, description: 'Number of tickets booked' })
  quantity: number;
}

export class CreateBookingDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BookingItemDto)
  @ArrayMinSize(1)
  @ApiProperty({
    type: [BookingItemDto],
    description: 'List of tickets to book',
  })
  items: BookingItemDto[];
}
