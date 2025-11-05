import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateTicketTypeDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    example: 'Early Bird',
    description: 'New name of the ticket type',
  })
  name?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  @IsPositive()
  @ApiPropertyOptional({
    example: 75.0,
    description: 'New ticket price',
  })
  price?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @ApiPropertyOptional({
    example: 120,
    description: 'Updated total number of tickets available',
  })
  totalQuantity?: number;
}
