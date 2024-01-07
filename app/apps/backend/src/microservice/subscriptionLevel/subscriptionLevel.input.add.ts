import { TelegramInput, Process, Step } from '@/common/telegram';
import { Injectable } from '@nestjs/common';
import { UserDbModel } from '@/db/model';
import { isNumber } from 'class-validator';

@Injectable()
export class SubscriptionLevelInputAdd extends TelegramInput {
  protected processName = 'profile_add_subscription_level';
  protected backCallback = { name: 'profile_levels' };
  protected steps = ['price'];

  protected async onSuccess(user: UserDbModel, process: Process) {
    const creator = await this.creatorDbRepository.findByUserAndUuid(user, process.context.creator);
    await this.subscriptionLevelService.create(creator, Number(process.inputs.price));
    return `Subscription level was successfully added!`;
  }

  protected price(): Step {
    return {
      prop: 'price',
      rule: 'It must be a number (for example: 1 or 10 or 5.5 or 14.35).',
      onStart: 'Now send me the preferred price of new subscription level.',
      onFail: 'Can not use this price :( Send me another preferred price, please!',
      transform: (input: string) => input.replace(',', '.'),
      validate: async (input: string): Promise<boolean | string> => {
        input = input.replace(',', '.');
        return isNumber(Number(input));
      },
    };
  }
}
