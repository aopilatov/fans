import { Models } from '@rematch/core';
import { app } from './app.model';
import { auth } from './auth.model.ts';

export interface RootModel extends Models<RootModel> {
  app: typeof app,
  auth: typeof auth,
}

export const models: RootModel = {
  app,
  auth,
};
