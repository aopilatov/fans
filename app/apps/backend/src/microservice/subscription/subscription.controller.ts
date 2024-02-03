import { Controller, Post, Get, Res, Body, UnauthorizedException, Headers } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { FastifyReply } from 'fastify';
import * as _ from 'lodash';

@Controller('/subscription')
export class SubscriptionController {
  constructor(
    @InjectQueue('subscription') private readonly subscriptionQueue: Queue,
  ) {}

  @Get()
  public async getSelf(@Headers() headers: Record<string, any>, @Res() res: FastifyReply): Promise<Record<string, any>> {
    const token = _.get(headers, 'x-authorization');
    const job = await this.subscriptionQueue.add('listForUser', { token });
    const result = await job.finished();
    if (!result) {
      throw new UnauthorizedException();
    }

    return res.code(200)
      .header('Content-Type', 'application/json')
      .send(result);
  }
}
