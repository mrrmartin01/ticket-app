import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class EditVenueDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'Grand Hall' })
  name?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: '123 Main St' })
  address?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'Astro World' })
  city?: string;

  @IsInt()
  @IsOptional()
  @ApiProperty({ example: 500 })
  capacity?: number;
}
