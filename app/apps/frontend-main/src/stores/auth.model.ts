import { createModel } from '@rematch/core';
import { RootModel } from './models';

interface AuthState {
  token: string;
}

export const auth = createModel<RootModel>()({
  state: {
    token: null,
  },

  reducers: {
    setToken: (state: AuthState, token: string) => {
      state.token = token;
      return state;
    },
  },

  // effects: (dispatch) => ({
  //
  // }),
});
