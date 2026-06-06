import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserRole } from '../../../common/roles.enum';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'meal-secret-key',
    });
  }

  async validate(payload: { userId: number; username: string; role: UserRole; realName: string }) {
    return {
      userId: payload.userId,
      username: payload.username,
      role: payload.role,
      realName: payload.realName,
    };
  }
}
