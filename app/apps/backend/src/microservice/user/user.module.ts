import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserProcessor } from './user.processor';
import { UserService } from './user.service';
import { TelegramModule } from '@/microservice/telegram';
import { UserDbRepository } from '@/db/repository';
import { UserDbModel } from '@/db/model';
import { AuthModule } from '@/microservice/auth';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'user' }),
    TypeOrmModule.forFeature([UserDbModel]),
    forwardRef(() => TelegramModule),
    AuthModule,
  ],
  controllers: [UserController],
  providers: [UserService, UserProcessor, UserDbRepository],
  exports: [UserService],
})
export class UserModule {}
