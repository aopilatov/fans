import { Injectable } from '@nestjs/common';
import { PostDbRepository } from '@/db/repository';

@Injectable()
export class PostService {
  constructor(
    private readonly postDbRepository: PostDbRepository,
  ) {}
}
