import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostDbModel } from '../model';

@Injectable()
export class PostDbRepository {
  constructor(
    @InjectRepository(PostDbModel)
    private readonly repository: Repository<PostDbModel>,
  ) {}

  private getBaseQuery() {
    return this.repository
      .createQueryBuilder('post');
  }
}
