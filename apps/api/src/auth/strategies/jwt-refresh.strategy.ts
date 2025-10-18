import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    const refreshToken = req.get('Authorization')?.replace('Bearer', '').trim();

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    // TODO: Check if refresh token exists in database and is not revoked
    // const storedToken = await this.authService.findRefreshToken(refreshToken);
    // if (!storedToken || storedToken.revoked) {
    //   throw new UnauthorizedException('Invalid refresh token');
    // }

    return {
      userId: payload.sub,
      email: payload.email,
      refreshToken,
    };
  }
}
