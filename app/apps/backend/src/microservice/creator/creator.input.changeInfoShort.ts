import { TelegramInput, Process, Step } from '@/common/telegram';
import { Injectable } from '@nestjs/common';
import { UserDbModel } from '@/db/model';
import { length, matches } from 'class-validator';

@Injectable()
export class CreatorInputChangeInfoShort extends TelegramInput {
  protected processName = 'profile_edit_info_short';
  protected backCallback = { name: 'profile_actions' };
  protected steps = ['infoShort'];

  protected async onSuccess(user: UserDbModel, process: Process) {
    const creator = await this.creatorDbRepository.findByUserAndUuid(user, process.context.creator);
    await this.creatorDbRepository.update({ ...creator, infoShort: process.inputs.infoShort });
    return `Short info was successfully changed!`;
  }

  protected infoShort(): Step {
    return {
      prop: 'infoShort',
      rule: 'Short info could not have less than 1 characters, and more than 50.',
      onStart: 'Ok! Send me the text.',
      onFail: 'Can not use this text :( Send me another one, please!',
      validate: async (input: string): Promise<boolean | string> => {
        return length(input, 1, 50);
      },
    };
  }
}
