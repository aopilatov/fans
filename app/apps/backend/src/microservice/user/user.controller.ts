import { Controller, Post, Get, Res, Body, UnauthorizedException, Headers } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { FastifyReply } from 'fastify';
import { UserAuthResponse, UserAuthDto } from './user.types';
import * as _ from 'lodash';

@Controller('/user')
export class UserController {
  constructor(
    @InjectQueue('user') private readonly userQueue: Queue,
  ) {}

  @Post('/auth')
  public async auth(@Body() body: UserAuthDto, @Res() res: FastifyReply): Promise<UserAuthResponse> {
    const job = await this.userQueue.add('auth', body);
    const result = await job.finished();
    if (!result) {
      throw new UnauthorizedException();
    }

    return res.code(200)
      .header('Content-Type', 'application/json')
      .send({ token: result });
  }

  @Get()
  public async getSelf(@Headers() headers: Record<string, any>, @Res() res: FastifyReply): Promise<Record<string, any>> {
    const token = _.get(headers, 'x-authorization');
    const job = await this.userQueue.add('self', { token });
    const result = await job.finished();
    if (!result) {
      throw new UnauthorizedException();
    }

    return res.code(200)
      .header('Content-Type', 'application/json')
      .send({ token: result });
  }
}
