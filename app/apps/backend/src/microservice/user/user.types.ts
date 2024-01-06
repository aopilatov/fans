import { IsString, IsUUID } from 'class-validator';

export interface UserAuthResponse {
  token: string;
}

export class UserAuthDto {
  @IsUUID()
  uuid: string;

  @IsString()
  check: string;
}