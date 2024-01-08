import { Process, Step } from '@/common/telegram';
import { Injectable } from '@nestjs/common';
import { CreatorInput } from './creator.input';
import { UserDbModel } from '@/db/model';
import { length, matches } from 'class-validator';

@Injectable()
export class CreatorInputChangeLogin extends CreatorInput {
  protected processName = 'profile_edit_login';
  protected backCallback = { name: 'creator_profile_menu' };
  protected steps = ['login'];

  protected async onSuccess(user: UserDbModel, process: Process) {
    const creator = await this.creatorDbRepository.findByUserAndUuid(user, process.context.creator);
    await this.creatorDbRepository.update({ ...creator, login: process.inputs.login });
    return `Nickname was successfully changed!`;
  }

  protected login(): Step {
    return {
      prop: 'login',
      rule: 'Login could not have less than 2 characters, and more than 20. No special characters and spaces, but \'-\', \'_\', and \'.\'',
      onStart: 'Now send me the preferred nickname. You could easily edit it after.',
      onFail: 'Can not use this login :( Send me another preferred nickname, please!',
      transform: (input: string) => input.toLowerCase(),
      validate: async (input: string): Promise<boolean | string> => {
        input = input.toLowerCase();

        const lengthCheck = length(input, 2, 20);
        if (!lengthCheck) return false;

        const charsCheck = matches(input, RegExp('^[a-z0-9-_.]+$'));
        if (!charsCheck) return 'Value contains not allowed character(s)';

        if (input.startsWith('.') || input.endsWith('.')) {
          return 'Value can not start or finish with \'.\'';
        }

        const userWithLogin = await this.creatorDbRepository.findByLogin(input);
        if (userWithLogin) {
          return `Nickname '${input}' is already picked :( Send me another preferred nickname, please!`;
        }

        return true;
      },
    };
  }
}
