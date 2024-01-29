import { createModel } from '@rematch/core';
import { RootModel } from './models';
import { reactLocalStorage } from 'reactjs-localstorage';

interface AuthState {
  token: string;
}

export const auth = createModel<RootModel>()({
  state: {
    token: reactLocalStorage.get('auth.token'),
  },

  reducers: {
    setToken: (state: AuthState, token: string) => {
      reactLocalStorage.set('auth.token', token);
      state.token = token;
      return state;
    },

    unsetToken: (state: AuthState) => {
      reactLocalStorage.remove('auth.token');
      state.token = null;
      return state;
    },
  },

  // effects: (dispatch) => ({
  //
  // }),
});
