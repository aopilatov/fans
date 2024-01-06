import { FastifyRequest } from 'fastify';
import * as _ from 'lodash';

export class TelegramHandlerManager {
  private static instances: Record<string, TelegramHandlerManager> = {};

  private readonly commands: Record<string, string> = {};
  private readonly callbackQueries: Record<string, string> = {};
  private process: string = null;

  public static getInstance(name: string): TelegramHandlerManager {
    if (!_.has(TelegramHandlerManager.instances, name)) {
      _.set(TelegramHandlerManager.instances, name, new TelegramHandlerManager());
    }

    return _.get(TelegramHandlerManager.instances, name);
  }

  public async handle(req: FastifyRequest): Promise<[string, Record<string, any>] | undefined> {
    const callbackQueryMessage: string = _.get(req, 'body.callback_query.data');
    if (callbackQueryMessage) {
      return this.handleCallbackQuery(req, callbackQueryMessage);
    }

    const cmdMessage: string = _.get(req, 'body.message.text');
    if (cmdMessage && cmdMessage.startsWith('/')) {
      const handleCommand = await this.handleCommand(req, cmdMessage);
      if (handleCommand) return handleCommand;
    }

    const handleInput = await this.handleInput(req);
    if (handleInput) return handleInput;

    return ['start', _.get(req, 'body.message', _.get(req, 'body.callback_query'))];
  }

  private async handleCommand(req: FastifyRequest, cmdMessage: string): Promise<[string, Record<string, any>]> {
    cmdMessage = cmdMessage.toLowerCase();

    const commandKeys = Object.keys(this.commands);
    commandKeys.sort();

    const key = commandKeys.find(item => item.startsWith(cmdMessage));
    if (!key) return;

    return [this.commands[key], {
      ..._.get(req, 'body.message', {}),
      system: {
        type: 'cmd',
        cmd: cmdMessage,
      },
    }];
  }

  private async handleCallbackQuery(req: FastifyRequest, callbackQueryMessage: string): Promise<[string, Record<string, any>]> {
    const callbackQueryKeys =  Object.keys(this.callbackQueries);

    const key = callbackQueryKeys.find(item => callbackQueryMessage.startsWith(item));
    if (!key) return;

    return [this.callbackQueries[key], {
      ..._.get(req, 'body.callback_query', {}),
      system: {
        type: 'callbackQuery',
        cmd: callbackQueryMessage,
      },
    }];
  }

  private async handleInput(req: FastifyRequest): Promise<[string, Record<string, any>]> {
    if (!this.process) return;

    const response: Record<string, any> = { ..._.get(req, 'body.message', {}) };
    if (_.has(req, 'body.message.text')) {
      response['system'] = {
        type: 'input',
        cmd: _.get(req, 'body.message.text'),
      };
    }

    if (_.has(req, 'body.message.photo')) {
      response['system'] = {
        type: 'photo',
        cmd: _.get(req, 'body.message.photo'),
      };
    }

    if (_.has(req, 'body.message.document')) {
      response['system'] = {
        type: 'photo',
        cmd: _.get(req, 'body.message.document'),
      };
    }

    if (!_.has(response, 'system.type')) {
      return;
    }

    return [this.process, response];
  }

  public addCommand(value: string, method: string): void {
    value = value.toLowerCase();

    if (_.has(this.commands, value)) {
      throw new Error(`Command '${value}' is already existing`);
    }

    _.set(this.commands, value, method);
  }

  public addCallbackQuery(value: string, method: string): void {
    value = value.toLowerCase();

    if (_.has(this.callbackQueries, value)) {
      throw new Error(`CallbackQuery '${value}' is already existing`);
    }

    _.set(this.callbackQueries, value, method);
  }

  public addProcess(method: string) {
    if (this.process) {
      throw new Error(`Process '${method}' is already existing`);
    }

    this.process = method;
  }
}
