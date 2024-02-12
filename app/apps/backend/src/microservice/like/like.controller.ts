import { Controller, Param, Res, UnauthorizedException, Headers, Patch } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { FastifyReply } from 'fastify';
import * as _ from 'lodash';

@Controller('/like')
export class LikeController {
  constructor(
    @InjectQueue('like') private readonly likeQueue: Queue,
  ) {}

  @Patch(':uuid')
  public async set(
    @Headers() headers: Record<string, any>,
    @Param('uuid') uuid: string,
    @Res() res: FastifyReply,
  ): Promise<Record<string, any>> {
    const token = _.get(headers, 'x-authorization');
    const job = await this.likeQueue.add('set', { token, uuid });
    const result = await job.finished();
    if (result === undefined) {
      throw new UnauthorizedException();
    }

    return res.code(200)
      .header('Content-Type', 'application/json')
      .send(result);
  }
}
