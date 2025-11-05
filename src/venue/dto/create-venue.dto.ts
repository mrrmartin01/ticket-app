import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateVenueDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Grand Hall' })
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '123 Main St' })
  address: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Astro World' })
  city: string;

  @IsInt()
  @IsNotEmpty()
  @ApiProperty({ example: 500 })
  capacity: number;
}
