import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '@prisma/client';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ user?: User }>();
    const user = request.user as User;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    if (user.role !== 'ADMIN') {
      throw new UnauthorizedException('User is not an admin');
    }

    return true;
  }
}
