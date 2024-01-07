import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { UserDbModel } from '@/db/model';
import { CreatorDbRepository } from '@/db/repository';
import { TelegramService } from '@/microservice/telegram';
import { MediaService } from '@/microservice/media';
import { SubscriptionLevelService } from '@/microservice/subscriptionLevel';
import * as _ from 'lodash';

interface Context {
  creator?: string;
}

export interface Process {
  messageId: number;
  type: string;
  context: Context;
  step: number;
  inputs: Record<string, any>;
  error?: boolean | string;
}

export interface Step {
  prop: string;
  transform?: (input: string) => string | Promise<string>;
  rule: string;
  onStart: string;
  onFail: string;
  validate: (input: any) => Promise<boolean | string>;
}

export abstract class TelegramInput {
  protected processName!: string;
  protected backCallback!: Record<string, any>;
  protected steps: string[] = [];

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
    protected readonly creatorDbRepository: CreatorDbRepository,
    protected readonly telegramService: TelegramService,
    protected readonly mediaService: MediaService,
    protected readonly subscriptionLevelService: SubscriptionLevelService,
  ) {}

  protected abstract onSuccess(user: UserDbModel, process: Process): Promise<string>;

  private async createProcess(user: UserDbModel, data: Record<string, any>): Promise<Process> {
    if (!this.processName) throw new Error('Name of the input process is not defined');
    if (!this.steps.length) throw new Error('Steps of the input process are not defined');

    const messageId = _.get(data, 'message.message_id');
    const context: Context = {};

    const message: string = _.get(data, 'data');
    if (_.has(data, 'system.cmd.context.creator')) _.set(context, 'creator', _.get(data, 'system.cmd.context.creator'));

    const process: Process = {
      messageId,
      context,
      type: this.processName,
      step: 1,
      inputs: {},
    };

    await this.cacheService.set(`creator.process.${user.uuid}`, process, 3600000);
    return process;
  }

  private async destroyProcess(user: UserDbModel): Promise<void> {
    await this.cacheService.del(`creator.process.${user.uuid}`);
  }

  public async proceed(user: UserDbModel, data: Record<string, any>, process?: Process): Promise<void> {
    let input!: any;
    let step!: Step;

    try {
      let newProcess = false;
      if (!process) {
        process = await this.createProcess(user, data);
        newProcess = true;
      }

      if (process.step > this.steps.length) {
        await this.destroyProcess(user);
        return;
      }

      const stepName: string = _.get(this.steps, `[${process.step - 1}]`);
      if (!stepName) {
        await this.destroyProcess(user);
        return;
      }

      step = _.invoke(this, stepName);
      if (!step) {
        await this.destroyProcess(user);
        return;
      }

      this.backCallback['context'] = {
        creator: process.context.creator,
      };

      input = _.get(data, 'system');
      if (input) {
        if (input.type === 'input') {
          input = input.cmd;
          if (input && step?.transform) input = step.transform(input);
        }
      }

      if (newProcess) {
        const message = `${step.onStart}\n${step.rule}`;

        await this.telegramService.botCreator.editMessageText(message, {
          chat_id: user.userTgId,
          message_id: process.messageId,
          reply_markup: {
            inline_keyboard: [[
              { text: '⬅️ Back', callback_data: await this.telegramService.registerCallback(user, this.backCallback['name'], _.get(this.backCallback, 'context')) },
            ]],
          },
        });

        return;
      }

      await this.telegramService.botCreator.deleteMessage(user.userTgId, _.get(data, 'message_id'));

      const validation = await step.validate(input);
      if (!validation || typeof validation === 'string') {
        throw new Error(validation.toString());
      }

      if (['media', 'file'].includes(input.type)) {
        if (step?.transform) input = await step.transform(input);
      }

      _.set(process, `inputs.${step.prop}`, input);

      if (process.step < this.steps.length) {
        const nextStepName: string = _.get(this.steps, `[${process.step}]`);
        const nextStep: Step = _.invoke(this, nextStepName);

        _.set(process, 'step', process.step + 1);
        await this.cacheService.set(`creator.process.${user.uuid}`, process, 3600000);

        const message = `${nextStep.onStart}\n${nextStep.rule}`;

        await this.telegramService.botCreator.editMessageText(message, {
          chat_id: user.userTgId,
          message_id: process.messageId,
          reply_markup: {
            inline_keyboard: [[
              { text: '⬅️ Back', callback_data: await this.telegramService.registerCallback(user, this.backCallback['name'], _.get(this.backCallback, 'context')) },
            ]],
          },
        });

        return;
      }

      const result = await this.onSuccess(user, process);
      await this.destroyProcess(user);

      await this.telegramService.botCreator.editMessageText(result, {
        chat_id: user.userTgId,
        message_id: process.messageId,
        reply_markup: {
          inline_keyboard: [[
            { text: '⬅️ Back', callback_data: await this.telegramService.registerCallback(user, this.backCallback['name'], _.get(this.backCallback, 'context')) },
          ]],
        },
      });

      return;
    } catch (err: any) {
      let errorMessage = '\n';
      if (!['true', 'false'].includes(err.message)) {
        errorMessage = `\n${err.message}\n\n`;
      }
      let inputText = input;
      if (['media', 'file'].includes(input.type)) {
        inputText = 'image'
      }
      const message = `Got '${inputText}' from you. ${step.onFail}${errorMessage}${step.rule}`;

      await this.telegramService.botCreator.editMessageText(message, {
        chat_id: user.userTgId,
        message_id: process.messageId,
        reply_markup: {
          inline_keyboard: [[
            { text: '⬅️ Back', callback_data: await this.telegramService.registerCallback(user, this.backCallback['name'], _.get(this.backCallback, 'context')) },
          ]],
        },
      });
    }
  }
}
