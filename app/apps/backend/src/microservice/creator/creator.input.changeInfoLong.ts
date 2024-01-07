import { TelegramInput, Process, Step } from '@/common/telegram';
import { Injectable } from '@nestjs/common';
import { UserDbModel } from '@/db/model';
import { length, matches } from 'class-validator';

@Injectable()
export class CreatorInputChangeInfoLong extends TelegramInput {
  protected processName = 'profile_edit_info_long';
  protected backCallback = { name: 'profile_actions' };
  protected steps = ['infoLong'];

  protected async onSuccess(user: UserDbModel, process: Process) {
    const creator = await this.creatorDbRepository.findByUserAndUuid(user, process.context.creator);
    await this.creatorDbRepository.update({ ...creator, infoLong: process.inputs.infoLong });
    return `Full description was successfully changed!`;
  }

  protected infoLong(): Step {
    return {
      prop: 'infoLong',
      rule: 'Full description could not have less than 1 characters, and more than 500.',
      onStart: 'Ok! Send me the text.',
      onFail: 'Can not use this text :( Send me another one, please!',
      validate: async (input: string): Promise<boolean | string> => {
        return length(input, 1, 500);
      },
    };
  }
}
