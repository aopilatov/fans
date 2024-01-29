import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreatorDbModel, UserDbModel } from '@/db/model';
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

  public async tokenForCreator(user: UserDbModel, creator: CreatorDbModel): Promise<string> {
    const payload: AuthToken = {
      sub: user.uuid,
      creator: creator.uuid,
      login: creator.login,
      type: 'creator',
    };
    return this.jwtService.signAsync(payload);
  }
}
