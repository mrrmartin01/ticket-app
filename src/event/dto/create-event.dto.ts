import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsISO8601 } from 'class-validator';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Venue ID where the event will take place' })
  venueId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Name of the event' })
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Description of the event' })
  description: string;

  @IsNotEmpty()
  @IsString()
  @IsISO8601()
  @ApiProperty({
    example: '2023-03-15T10:00:00Z',
    type: 'string',
    format: 'date-time',
  })
  dateTime: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ example: 120 })
  durationMinutes: number;
}
