import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllUsers(limit = 10, cursor?: string) {
    const users = await this.prisma.user.findMany({
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: [{ id: 'desc' }],
    });
    const userWithoutPassword = users.map(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ({ passwordHash: _passwordHash, ...user }) => user,
    );
    const nextCursor =
      users.length === limit ? users[users.length - 1].id : null;
    return {
      data: userWithoutPassword,
      meta: {
        nextCursor,
        hasMore: !!nextCursor,
      },
    };
  }

  async updateUserProfile(
    userId: string,
    dto: UpdateUserDto,
  ): Promise<{ message: string }> {
    if (!userId) throw new ForbiddenException('No user id');
    if (!dto || Object.keys(dto).length === 0)
      throw new BadRequestException('No data was provided');

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (dto.email) dto.email = dto.email.toLowerCase().trim();
    if (dto.firstName) dto.firstName = dto.firstName.toLowerCase().trim();
    if (dto.lastName) dto.lastName = dto.lastName.toLowerCase().trim();

    if (dto.email) {
      const existingEmail = await this.prisma.user.findFirst({
        where: { email: dto.email },
      });
      if (existingEmail && existingEmail.id !== user.id)
        throw new BadRequestException('Email is taken');
    }

    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: dto,
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ForbiddenException('Email already taken');
      }
      throw error;
    }

    return { message: 'Profile edited successfully' };
  }
}
