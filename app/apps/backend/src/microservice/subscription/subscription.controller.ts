import { Controller, Param, Get, Res, UnauthorizedException, Headers, Patch, Body } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { FastifyReply } from 'fastify';
import { SubscriptionChangeDto } from './subscription.types';
import * as _ from 'lodash';

@Controller('/subscription')
export class SubscriptionController {
  constructor(
    @InjectQueue('subscription') private readonly subscriptionQueue: Queue,
  ) {}

  @Get()
  public async listForUser(@Headers() headers: Record<string, any>, @Res() res: FastifyReply): Promise<Record<string, any>> {
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

  @Get(':login')
  public async getOne(
    @Headers() headers: Record<string, any>,
    @Param('login') login: string,
    @Res() res: FastifyReply,
  ): Promise<Record<string, any>> {
    const token = _.get(headers, 'x-authorization');
    const job = await this.subscriptionQueue.add('getOne', { token, login });
    const result = await job.finished();
    if (!result) {
      throw new UnauthorizedException();
    }

    return res.code(200)
      .header('Content-Type', 'application/json')
      .send(result);
  }

  @Patch(':login')
  public async change(
    @Headers() headers: Record<string, any>,
    @Param('login') login: string,
    @Body() body: SubscriptionChangeDto,
    @Res() res: FastifyReply,
  ): Promise<Record<string, any>> {
    const token = _.get(headers, 'x-authorization');
    const job = await this.subscriptionQueue.add('change', { token, login, ...body });
    const result = await job.finished();
    if (result === undefined) {
      throw new UnauthorizedException();
    }

    return res.code(200)
      .header('Content-Type', 'application/json')
      .send(result);
  }

  @Patch(':login/notification')
  public async notification(
    @Headers() headers: Record<string, any>,
    @Param('login') login: string,
    @Res() res: FastifyReply,
  ): Promise<Record<string, any>> {
    const token = _.get(headers, 'x-authorization');
    const job = await this.subscriptionQueue.add('notification', { token, login });
    const result = await job.finished();
    if (result === undefined) {
      throw new UnauthorizedException();
    }

    return res.code(200)
      .header('Content-Type', 'application/json')
      .send(result);
  }
}
