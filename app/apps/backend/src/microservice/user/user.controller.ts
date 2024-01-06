import { Controller, Post, Res, Body, UnauthorizedException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { FastifyReply } from 'fastify';
import { UserAuthResponse, UserAuthDto } from './user.types';

@Controller('/user')
export class UserController {
  constructor(
    @InjectQueue('user') private readonly userQueue: Queue,
  ) {}

  @Post('/auth')
  public async getSelf(@Body() body: UserAuthDto, @Res() res: FastifyReply): Promise<UserAuthResponse> {
    const job = await this.userQueue.add('auth', body);
    const result = await job.finished();
    if (!result) {
      throw new UnauthorizedException();
    }

    return res.code(200)
      .header('Content-Type', 'application/json')
      .send({ token: result });
  }
}
