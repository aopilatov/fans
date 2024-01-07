import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { UserDbModel } from '@/db/model';

@Injectable()
export class CreatorService {
  constructor(
    @InjectQueue('user') private readonly userQueue: Queue,
  ) {}

  public async getUser(data: Record<string, any>): Promise<UserDbModel> {
    const userJob = await this.userQueue.add('get_user', data);
    return userJob.finished();
  }
}
