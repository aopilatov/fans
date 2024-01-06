import { TelegramInput, Process, Step } from '@/common/telegram';
import { Injectable } from '@nestjs/common';
import { UserDbModel } from '@/db/model';

@Injectable()
export class CreatorInputChangeImage extends TelegramInput {
  protected processName = 'profile_edit_image';
  protected backCallback = 'profile_actions_{login}';
  protected steps = ['image'];

  protected async onSuccess(user: UserDbModel, process: Process) {
    const creator = await this.creatorDbRepository.findByUserAndLogin(user, process.context.login);
    return `Image successfully updated!`;
  }

  protected image(): Step {
    return {
      prop: 'image',
      rule: 'It must have same width and height!',
      onStart: 'Ok! Send me the profile image!',
      onFail: 'Can not use this image :( Send me another one, please!',
      validate: async (input: unknown): Promise<boolean | string> => {
        return true;
      },
    };
  }
}
