import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { hashPassword, verifyPassword } from './utils/password.utils';
import { SignInDto } from './dto/signIn.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(dto: CreateUserDto) {
    if (!dto)
      throw new BadRequestException({
        message: 'You can not summit an empty form',
        error: 'EMPTY_FORM',
        statusCode: 'E1001',
      });

    if (!dto.email || !dto.password || !dto.firstName || !dto.lastName)
      throw new BadRequestException({
        message: 'You must fill all the required form fields',
        error: 'PARTIAL_DATA_INPUT',
        statusCode: 'E1001A',
      });

    const ExistingUser = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });

    if (ExistingUser)
      throw new BadRequestException({
        message: 'User with this email already exists',
        error: 'USER_ALREADY_EXISTS',
        statusCode: 'E1002',
      });

    const hash = await hashPassword(dto.password);

    await this.prisma.user.create({
      data: {
        firstName: dto.firstName.toLocaleLowerCase().trim(),
        lastName: dto.lastName.toLocaleLowerCase().trim(),
        email: dto.email.toLocaleLowerCase().trim(),
        passwordHash: hash,
      },
    });
    return { message: 'User created successfully' };
  }

  async signIn(dto: SignInDto) {
    if (!dto)
      throw new BadRequestException({
        message: 'You can not summit an empty form',
        error: 'EMPTY_FORM',
        statusCode: 'E1001',
      });

    if (!dto.email || !dto.password)
      throw new BadRequestException({
        message: 'You must fill all the required form fields',
        error: 'PARTIAL_DATA_INPUT',
        statusCode: 'E1001A',
      });

    const user = await this.prisma.user.findFirst({
      where: {
        email: dto.email.toLocaleLowerCase().trim(),
      },
    });

    if (!user)
      throw new NotFoundException({
        message: 'Not user exists with such credentials',
        error: 'USER_NOT_FOUND',
        statusCode: 'N0404',
      });

    const unhashedPassword = await verifyPassword(
      user.passwordHash,
      dto.password,
    );

    if (!unhashedPassword)
      throw new UnauthorizedException({
        message: 'Invalid email or password',
        error: 'WRONG_CREDENTALS',
        statusCode: 'U1001',
      });

    return {
      access_token: this.jwtService.sign({ id: user.id, email: user.email }),
    };
  }

  async forgotPassword(email: string, password: string) {
    if (!email)
      throw new BadRequestException({
        message: 'You can not summit an empty form',
        error: 'EMPTY_FORM',
        statusCode: 'E1001',
      });

    const user = await this.prisma.user.findUnique({
      where: { email: email.toLocaleLowerCase().trim() },
    });
    if (!user)
      throw new NotFoundException({
        message: 'Not user exists with such credentials',
        error: 'USER_NOT_FOUND',
        statusCode: 'N0404',
      });

    const samePassword = await verifyPassword(user?.passwordHash, password);

    if (samePassword)
      throw new ForbiddenException({
        message: 'Please enter a different password from the previous one',
        error: 'SAME_PASSWORD',
        status: 'SP1001',
      });

    const hash = await hashPassword(password);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hash,
      },
    });
    return { message: 'Password reset successful' };
  }
}
