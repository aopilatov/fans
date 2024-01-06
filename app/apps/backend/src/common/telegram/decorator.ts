import { TelegramHandlerManager } from './manager';

export function TelegramHandler(name: string) {
  return (target: any, prop?: string, descriptor?: TypedPropertyDescriptor<any>) => {
    if (prop && descriptor) {
      throw new Error('"TelegramHandler" decorator could be used only for classes');
    }

    const manager = TelegramHandlerManager.getInstance(name);

    if (Reflect.hasMetadata('commands', target)) {
      const commands: Map<string, string> = Reflect.getMetadata('commands', target);
      Array.from(commands.keys()).forEach(value => {
        manager.addCommand(value, commands.get(value));
      });
    }

    if (Reflect.hasMetadata('callbackQueries', target)) {
      const callbackQueries: Map<string, string> = Reflect.getMetadata('callbackQueries', target);
      Array.from(callbackQueries.keys()).forEach(value => {
        manager.addCallbackQuery(value, callbackQueries.get(value));
      });
    }

    if (Reflect.hasMetadata('process', target)) {
      manager.addProcess(Reflect.getMetadata('process', target));
    }

    return target;
  };
}

export function TelegramCommand(value: string) {
  return (target: any, prop: any, descriptor: TypedPropertyDescriptor<any>) => {
    if (prop && descriptor) {
      const map = Reflect.hasMetadata('commands', target.constructor) ? Reflect.getMetadata('commands', target.constructor) : new Map();
      map.set(value, prop);

      Reflect.defineMetadata('commands', map, target.constructor);
      return target;
    }

    throw new Error('"TelegramCommand" decorator could be used only for method');
  };
}

export function TelegramCallbackQuery(value: string) {
  return (target: any, prop: any, descriptor: TypedPropertyDescriptor<any>) => {
    if (prop && descriptor) {
      const map = Reflect.hasMetadata('callbackQueries', target.constructor) ? Reflect.getMetadata('callbackQueries', target.constructor) : new Map();
      map.set(value, prop);

      Reflect.defineMetadata('callbackQueries', map, target.constructor);
      return target;
    }

    throw new Error('"TelegramCallbackQuery" decorator could be used only for method');
  };
}

export function TelegramProcess() {
  return (target: any, prop: any, descriptor: TypedPropertyDescriptor<any>) => {
    if (prop && descriptor) {
      Reflect.defineMetadata('process', prop, target.constructor);
      return target;
    }

    throw new Error('"TelegramProcess" decorator could be used only for method');
  };
}
