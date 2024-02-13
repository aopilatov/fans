import { Controller, Post, Get, Res, Body, Param, UnauthorizedException, UseGuards } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { FastifyReply } from 'fastify';
import { UserAuthResponse, CreatorAuthDto, CreatorSearch } from '@/microservice/user/user.types';
import { UserGuard } from '@/guard/user.guard';

@Controller('/creator')
export class CreatorController {
  constructor(
    @InjectQueue('creator') private readonly creatorQueue: Queue,
  ) {}

  @Post('/auth')
  public async auth(@Body() body: CreatorAuthDto, @Res() res: FastifyReply): Promise<UserAuthResponse> {
    const job = await this.creatorQueue.add('auth', body);
    const result = await job.finished();
    if (!result) {
      throw new UnauthorizedException();
    }

    return res.code(200)
      .header('Content-Type', 'application/json')
      .send({ token: result });
  }

  @Post('/search')
  @UseGuards(UserGuard)
  public async search(@Body() body: CreatorSearch, @Res() res: FastifyReply) {
    const job = await this.creatorQueue.add('search', body);
    const result = await job.finished();
    if (!result) {
      throw new UnauthorizedException();
    }

    return res.code(200)
      .header('Content-Type', 'application/json')
      .send(result);
  }

  @Get(':login')
  @UseGuards(UserGuard)
  public async getProfile(
    @Param('login') login: string,
    @Res() res: FastifyReply
  ): Promise<Record<string, any>> {
    try {
      const job = await this.creatorQueue.add('get_creator', { login });
      const result = await job.finished();
      if (!result) {
        throw new Error(result);
      }

      return res.code(200)
        .header('Content-Type', 'application/json')
        .send(result);
    } catch (e: any) {
      return res.code(500)
        .header('Content-Type', 'application/json')
        .send(e.message);
    }
  }
}
