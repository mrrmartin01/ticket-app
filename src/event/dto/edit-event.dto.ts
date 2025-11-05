import { ApiProperty } from '@nestjs/swagger';
import { IsISO8601, IsNumber, IsOptional, IsString } from 'class-validator';

export class EditEventDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'Venue ID where the event will take place' })
  venueId?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'Name of the event' })
  name?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'Description of the event' })
  description?: string;

  @IsOptional()
  @IsString()
  @IsISO8601()
  @ApiProperty({
    example: '2023-03-15T10:00:00Z',
    type: 'string',
    format: 'date-time',
  })
  dateTime?: string;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ example: 120 })
  durationMinutes?: number;
}
