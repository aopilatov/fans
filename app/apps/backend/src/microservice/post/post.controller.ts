import { Controller, UseGuards, Post, Get, Res, Body, Headers, Param, Put } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { CreatorGuard } from '@/guard/creator.guard';
import { UserGuard } from '@/guard/user.guard';
import { PostCreateDto, PostEditDto } from './post.types';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import * as _ from 'lodash';

@Controller('/post')
export class PostController {
  constructor(
    @InjectQueue('post') private readonly postQueue: Queue,
  ) {}

  @UseGuards(UserGuard)
  @Get('/feed')
  public async feed(
    @Headers() headers: Record<string, any>,
    @Res() res: FastifyReply
  ): Promise<any> {
    try {
      const token = _.get(headers, 'x-authorization');
      const job = await this.postQueue.add('feed', { token });
      const result = await job.finished();
      if (!result) {
        throw new Error('Can not fetch posts');
      }

      return res.code(200)
        .header('Content-Type', 'application/json')
        .send(result);
    } catch (e: unknown) {
      return res.code(_.get(e, 'code', 500))
        .header('Content-Type', 'application/json')
        .send({ message: _.get(e, 'message', 'Internal server error') });
    }
  }

  @UseGuards(UserGuard)
  @Get(':creator')
  public async listForUser(
    @Headers() headers: Record<string, any>,
    @Param('creator') creator: string,
    @Res() res: FastifyReply
  ): Promise<any> {
    try {
      const token = _.get(headers, 'x-authorization');
      const job = await this.postQueue.add('listForUser', { token, creator });
      const result = await job.finished();
      if (!result) {
        throw new Error('Can not fetch posts');
      }

      return res.code(200)
        .header('Content-Type', 'application/json')
        .send(result);
    } catch (e: unknown) {
      return res.code(_.get(e, 'code', 500))
        .header('Content-Type', 'application/json')
        .send({ message: _.get(e, 'message', 'Internal server error') });
    }
  }

  @UseGuards(UserGuard)
  @Get(':creator/photos')
  public async listPhotosForUser(
    @Headers() headers: Record<string, any>,
    @Param('creator') creator: string,
    @Res() res: FastifyReply
  ): Promise<any> {
    try {
      const token = _.get(headers, 'x-authorization');
      const job = await this.postQueue.add('listPhotosForUser', { token, creator });
      const result = await job.finished();
      if (!result) {
        throw new Error('Can not fetch posts');
      }

      return res.code(200)
        .header('Content-Type', 'application/json')
        .send(result);
    } catch (e: unknown) {
      return res.code(_.get(e, 'code', 500))
        .header('Content-Type', 'application/json')
        .send({ message: _.get(e, 'message', 'Internal server error') });
    }
  }

  @UseGuards(UserGuard)
  @Get(':creator/videos')
  public async listVideosForUser(
    @Headers() headers: Record<string, any>,
    @Param('creator') creator: string,
    @Res() res: FastifyReply
  ): Promise<any> {
    try {
      const token = _.get(headers, 'x-authorization');
      const job = await this.postQueue.add('listVideosForUser', { token, creator });
      const result = await job.finished();
      if (!result) {
        throw new Error('Can not fetch posts');
      }

      return res.code(200)
        .header('Content-Type', 'application/json')
        .send(result);
    } catch (e: unknown) {
      return res.code(_.get(e, 'code', 500))
        .header('Content-Type', 'application/json')
        .send({ message: _.get(e, 'message', 'Internal server error') });
    }
  }

  @UseGuards(UserGuard)
  @Get(':creator/:uuid')
  public async getOneForUser(
    @Headers() headers: Record<string, any>,
    @Param('creator') creator: string,
    @Param('uuid') uuid: string,
    @Res() res: FastifyReply
  ): Promise<any> {
    try {
      const token = _.get(headers, 'x-authorization');
      const job = await this.postQueue.add('getOneForUser', { token, creator, uuid });
      const result = await job.finished();
      if (!result) {
        throw new Error('Can not fetch posts');
      }

      return res.code(200)
        .header('Content-Type', 'application/json')
        .send(result);
    } catch (e: unknown) {
      return res.code(_.get(e, 'code', 500))
        .header('Content-Type', 'application/json')
        .send({ message: _.get(e, 'message', 'Internal server error') });
    }
  }

  @UseGuards(UserGuard)
  @Get(':creator/:uuid/export')
  public async export(
    @Headers() headers: Record<string, any>,
    @Param('creator') creator: string,
    @Param('uuid') uuid: string,
    @Res() res: FastifyReply
  ): Promise<Record<string, any>> {
    const token = _.get(headers, 'x-authorization');
    await this.postQueue.add('export', { token, creator, uuid });

    return res.code(200)
      .header('Content-Type', 'application/json')
      .send({ success: true });
  }

  @UseGuards(CreatorGuard)
  @Get('/full')
  public async listForCreator(
    @Headers() headers: Record<string, any>,
    @Res() res: FastifyReply
  ): Promise<any> {
    try {
      const token = _.get(headers, 'x-authorization');
      const job = await this.postQueue.add('listForCreator', { token });
      const result = await job.finished();
      if (!result) {
        throw new Error('Can not fetch posts');
      }

      return res.code(200)
        .header('Content-Type', 'application/json')
        .send(result);
    } catch (e: unknown) {
      return res.code(_.get(e, 'code', 500))
        .header('Content-Type', 'application/json')
        .send({ message: _.get(e, 'message', 'Internal server error') });
    }
  }

  @UseGuards(CreatorGuard)
  @Get('/full/:uuid')
  public async getForCreator(
    @Headers() headers: Record<string, any>,
    @Param('uuid') uuid: string,
    @Res() res: FastifyReply
  ): Promise<any> {
    try {
      const token = _.get(headers, 'x-authorization');
      const job = await this.postQueue.add('getForCreator', { token, uuid });
      const result = await job.finished();
      if (!result) {
        throw new Error('Can not fetch posts');
      }

      return res.code(200)
        .header('Content-Type', 'application/json')
        .send(result);
    } catch (e: unknown) {
      return res.code(_.get(e, 'code', 500))
        .header('Content-Type', 'application/json')
        .send({ message: _.get(e, 'message', 'Internal server error') });
    }
  }

  @UseGuards(CreatorGuard)
  @Post()
  public async create(
    @Headers() headers: Record<string, any>,
    @Body() body: PostCreateDto,
    @Res() res: FastifyReply
  ): Promise<any> {
    try {
      const token = _.get(headers, 'x-authorization');
      const job = await this.postQueue.add('create', { ...body, token });
      const result = await job.finished();
      if (!result) {
        throw new Error('Can not create the post');
      }

      return res.code(200)
        .header('Content-Type', 'application/json')
        .send({ uuid: result.uuid });
    } catch (e: unknown) {
      return res.code(_.get(e, 'code', 500))
        .header('Content-Type', 'application/json')
        .send({ message: _.get(e, 'message', 'Internal server error') });
    }
  }

  @UseGuards(CreatorGuard)
  @Put('')
  public async edit(
    @Headers() headers: Record<string, any>,
    @Body() body: PostEditDto,
    @Res() res: FastifyReply
  ): Promise<any> {
    try {
      const token = _.get(headers, 'x-authorization');
      const job = await this.postQueue.add('edit', { ...body, token });
      const result = await job.finished();
      if (!result) {
        throw new Error('Can not create the post');
      }

      return res.code(200)
        .header('Content-Type', 'application/json')
        .send({ uuid: result.uuid });
    } catch (e: unknown) {
      return res.code(_.get(e, 'code', 500))
        .header('Content-Type', 'application/json')
        .send({ message: _.get(e, 'message', 'Internal server error') });
    }
  }
}
