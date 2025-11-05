import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { VenueService } from './venue.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateVenueDto } from './dto/create-venue.dto';
import { EditVenueDto } from './dto/edit-venue.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AdminGuard } from 'src/auth/guards/admin.guard';

@UseGuards(JwtAuthGuard)
@Controller('venue')
@ApiTags('Venue Management')
export class VenueController {
  constructor(private readonly venueService: VenueService) {}

  @Get('all') //venues/all?limit=10&cursor={:id}
  getAllVenues(@Query('limit') limit = 10, @Query('cursor') cursor?: string) {
    return this.venueService.getAllVenues(Number(limit), cursor);
  }

  @Get(':id')
  getVenueById(@Param('id') id: string) {
    return this.venueService.getVenueById(id);
  }

  @UseGuards(AdminGuard)
  @Post('create')
  createVenue(@Body() createVenueDto: CreateVenueDto) {
    return this.venueService.createVenue(createVenueDto);
  }

  @Patch('edit/:id')
  editVenue(@Param('id') id: string, @Body() editVenueDto: EditVenueDto) {
    return this.venueService.editVenue(id, editVenueDto);
  }

  @Delete('delete/:id')
  deleteVenue(@Param('id') id: string) {
    return this.venueService.deleteVenue(id);
  }
}
