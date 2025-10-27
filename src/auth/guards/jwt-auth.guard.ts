import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

interface JwtPayload {
  id: string;
  email: string;
  iat?: number;
  exp?: number;
}
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest<TUser = JwtPayload>(err: any, user: TUser | false): TUser {
    if (err || !user) {
      throw new UnauthorizedException('Invalid or missing JWT');
    }
    return user;
  }
}
