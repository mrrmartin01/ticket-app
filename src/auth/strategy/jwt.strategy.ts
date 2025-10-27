import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    const secret = configService.get<string>('JWT_SECRET_KEY', { infer: true });
    if (!secret) {
      throw new Error('JWT_SECRET_KEY is not set in configuration');
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        JwtStrategy.extractJWT,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      secretOrKey: secret,
      ignoreExpiration: false,
    });
  }

  private static extractJWT(this: void, req: Request): string | null {
    if (req.cookies?.access_token) {
      return req.cookies.access_token as string;
    }
    return null;
  }

  validate(payload: string | object) {
    return payload;
  }
}
