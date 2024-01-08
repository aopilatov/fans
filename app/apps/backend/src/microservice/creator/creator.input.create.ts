import { Process, Step } from '@/common/telegram';
import { Injectable } from '@nestjs/common';
import { CreatorInput } from './creator.input';
import { UserDbModel } from '@/db/model';
import { length, matches } from 'class-validator';

@Injectable()
export class CreatorInputCreate extends CreatorInput {
  protected processName = 'create';
  protected backCallback = { name: 'start_back' };
  protected steps = ['name', 'login'];

  protected async onSuccess(user: UserDbModel, process: Process) {
    const creator = await this.creatorDbRepository.create(user, process.inputs.login.toLowerCase(), process.inputs.name, 'My short introduction');
    await this.subscriptionLevelService.create(creator, 0);
    return `Name: ${process.inputs.name}\nNickname: ${process.inputs.login}\n\nNice! We are done! Profile successfully created!`;
  }

  protected name(): Step {
    return {
      prop: 'name',
      rule: 'Name could not have less than 2 characters, and more than 20.',
      onStart: 'Ok! Send me the preferred name. You could easily edit it after.',
      onFail: 'Can not use this name :( Send me another preferred name, please!',
      validate: async (input: string): Promise<boolean | string> => {
        return length(input, 2, 20);
      },
    };
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
