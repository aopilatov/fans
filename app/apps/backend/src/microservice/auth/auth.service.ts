import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserDbModel } from '@/db/model';
import { AuthToken } from './auth.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
  ) {}

  public async tokenForUser(user: UserDbModel): Promise<string> {
    const payload: AuthToken = { sub: user.uuid, type: 'user' };
    return this.jwtService.signAsync(payload);
  }
}
