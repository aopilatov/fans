import { FastifyRequest } from 'fastify';
import { Cache } from 'cache-manager';
import { TelegramService } from '@/microservice/telegram';
import { UserService } from '@/microservice/user';
import * as _ from 'lodash';

export class TelegramHandlerManager {
  private static instances: Record<string, TelegramHandlerManager> = {};
  private static cacheService: Cache;
  private static userService: UserService;
  private static telegramService: TelegramService;

  private readonly commands: Record<string, string> = {};
  private readonly callbackQueries: Record<string, string> = {};
  private readonly processes: Record<string, string> = {};

  public static getInstance(name: string): TelegramHandlerManager {
    if (!_.has(TelegramHandlerManager.instances, name)) {
      _.set(TelegramHandlerManager.instances, name, new TelegramHandlerManager());
    }

    return _.get(TelegramHandlerManager.instances, name);
  }

  public static setCacheService(cacheService: Cache) {
    if (!TelegramHandlerManager.cacheService) {
      TelegramHandlerManager.cacheService = cacheService;
    }
  }

  public static setTelegramService(telegramService: TelegramService) {
    if (!TelegramHandlerManager.telegramService) {
      TelegramHandlerManager.telegramService = telegramService;
    }
  }

  public static setUserService(userService: UserService) {
    if (!TelegramHandlerManager.userService) {
      TelegramHandlerManager.userService = userService;
    }
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
    const userTgId = parseInt(_.get(req, 'body.callback_query.from.id', ''));
    if (!userTgId) return;

    const callbackQuery = await TelegramHandlerManager.telegramService.getCallback(userTgId, callbackQueryMessage);
    if (!callbackQuery) return;

    const callbackQueryKeys =  Object.keys(this.callbackQueries);

    const key = callbackQueryKeys.find(item => callbackQuery.name === item);
    if (!key) return;

    return [this.callbackQueries[key], {
      ..._.get(req, 'body.callback_query', {}),
      system: {
        type: 'callbackQuery',
        cmd: callbackQuery,
      },
    }];
  }

  private async handleInput(req: FastifyRequest): Promise<[string, Record<string, any>]> {
    if (!Object.keys(this.processes)?.length) return;

    const response: Record<string, any> = { ..._.get(req, 'body.message', {}) };
    if (_.has(req, 'body.message.text')) {
      response['system'] = {
        type: 'input',
        cmd: _.get(req, 'body.message.text'),
      };
    }

    if (_.has(req, 'body.message.photo')) {
      response['system'] = {
        type: 'media',
        cmd: _.get(req, 'body.message.photo'),
      };
    }

    if (_.has(req, 'body.message.document')) {
      response['system'] = {
        type: 'file',
        cmd: _.get(req, 'body.message.document'),
      };
    }

    if (_.has(req, 'body.message.media_group_id')) {
      const mediaGroupId = _.get(req, 'body.message.media_group_id');
      const mediaGroupCache = await TelegramHandlerManager.cacheService.get(`media_group:${mediaGroupId}`);
      if (!mediaGroupCache) {
        await TelegramHandlerManager.cacheService.set(`media_group:${mediaGroupId}`, 1);
        response['system'] = {
          type: 'media_group',
          cmd: mediaGroupId,
        };
      } else {
        response['system'] = {
          type: 'action',
          cmd: 'stop',
        };
      }
    }

    if (!_.has(response, 'system.type')) {
      return;
    }

    const user = await TelegramHandlerManager.userService.getOrCreate(response);
    response['user'] = user;
    if (!user) return;

    let keys = await TelegramHandlerManager.cacheService.store.keys(`input:*:${user.uuid}`);
    if (!keys?.length) return;

    const key = keys[0]
      .replace('input:', '')
      .replace(`:${user.uuid}`, '');

    const process = _.get(this.processes, key);
    return [process, response];
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

  public addProcess(value: string, method: string) {
    value = value.toLowerCase();

    if (_.has(this.processes, value)) {
      throw new Error(`Process '${value}' is already existing`);
    }

    _.set(this.processes, value, method);
  }
}
