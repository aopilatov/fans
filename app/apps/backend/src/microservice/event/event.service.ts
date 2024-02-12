import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { UserDbModel } from '@/db/model';

@Injectable()
export class EventService {
  constructor(
    @InjectQueue('event') private readonly eventQueue: Queue,
  ) {}

  public async postExport(user: UserDbModel, post: Record<string, any>) {
    await this.eventQueue.add('postExport', { user, post });
  }
}
