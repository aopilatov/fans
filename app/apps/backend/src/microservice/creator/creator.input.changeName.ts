import { Process, Step } from '@/common/telegram';
import { Injectable } from '@nestjs/common';
import { CreatorInput } from './creator.input';
import { UserDbModel } from '@/db/model';
import { length } from 'class-validator';

@Injectable()
export class CreatorInputChangeName extends CreatorInput {
  protected processName = 'profile_edit_name';
  protected backCallback = { name: 'creator_profile_menu' };
  protected steps = ['name'];

  protected async onSuccess(user: UserDbModel, process: Process) {
    const creator = await this.creatorDbRepository.findByUserAndUuid(user, process.context.creator);
    await this.creatorDbRepository.update({ ...creator, name: process.inputs.name });
    return `Name was successfully changed!`;
  }

  protected name(): Step {
    return {
      prop: 'name',
      rule: 'Name could not have less than 2 characters, and more than 20.',
      onStart: 'Ok! Send me the preferred name.',
      onFail: 'Can not use this name :( Send me another preferred name, please!',
      validate: async (input: string): Promise<boolean | string> => {
        return length(input, 2, 20);
      },
    };
  }
}
