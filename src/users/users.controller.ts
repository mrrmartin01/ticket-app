import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { UpdateUserDto } from './dto/update-user.dto';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get('profile')
  getProfile(@GetUser() user: User) {
    return user;
  }

  @Patch('update-profile')
  updateProfile(@GetUser('id') userId: string, @Body() dto: UpdateUserDto) {
    return this.userService.updateUserProfile(userId, dto);
  }

  @Auth()
  @Get('all')
  async getAllUsers() {
    return this.userService.findAll();
  }
}
