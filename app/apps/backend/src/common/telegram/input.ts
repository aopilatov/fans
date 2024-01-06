import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { UserDbModel } from '@/db/model';
import { CreatorDbRepository } from '@/db/repository';
import { TelegramService } from '@/microservice/telegram';
import * as _ from 'lodash';

interface Context {
  login?: string;
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
  transform?: (input: string) => string;
  rule: string;
  onStart: string;
  onFail: string;
  validate: (input: any) => Promise<boolean | string>;
};

export abstract class TelegramInput {
  protected processName!: string;
  protected backCallback!: string;
  protected steps: string[] = [];

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
    protected readonly creatorDbRepository: CreatorDbRepository,
    private readonly telegramService: TelegramService,
  ) {}

  protected abstract onSuccess(user: UserDbModel, process: Process): Promise<string>;

  private async createProcess(user: UserDbModel, data: Record<string, any>): Promise<Process> {
    if (!this.processName) throw new Error('Name of the input process is not defined');
    if (!this.steps.length) throw new Error('Steps of the input process are not defined');

    const messageId = _.get(data, 'message.message_id');
    const context: Context = {};

    const message: string = _.get(data, 'data');
    if (message && message.includes(`${this.processName}_`)) {
      _.set(context, 'login', message.replace(`${this.processName}_`, '').toLowerCase());
    }

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

    const step: Step = _.invoke(this, stepName);
    if (!step) {
      await this.destroyProcess(user);
      return;
    }

    if (this.backCallback.includes('_{login}') && process.context?.login) {
      this.backCallback = this.backCallback.replace('{login}', process.context.login);
    }

    let input = _.get(data, 'text');
    if (input && step?.transform) input = step.transform(input);

    if (newProcess) {
      const message = `${step.onStart}\n${step.rule}`;

      await this.telegramService.botCreator.editMessageText(message, {
        chat_id: user.userTgId,
        message_id: process.messageId,
        reply_markup: {
          inline_keyboard: [[
            { text: '⬅️ Back', callback_data: this.backCallback },
          ]],
        },
      });

      return;
    }

    await this.telegramService.botCreator.deleteMessage(user.userTgId, _.get(data, 'message_id'));

    const validation = await step.validate(input);
    if (!validation || typeof validation === 'string') {
      let errorMessage = '\n';
      if (typeof validation === 'string') {
        errorMessage = `\n${validation}\n\n`;
      }
      const message = `Got '${input}' from you. ${step.onFail}${errorMessage}${step.rule}`;

      await this.telegramService.botCreator.editMessageText(message, {
        chat_id: user.userTgId,
        message_id: process.messageId,
        reply_markup: {
          inline_keyboard: [[
            { text: '⬅️ Back', callback_data: this.backCallback },
          ]],
        },
      });

      return;
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
            { text: '⬅️ Back', callback_data: this.backCallback },
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
          { text: '⬅️ Back', callback_data: this.backCallback },
        ]],
      },
    });

    return;
  }
}
