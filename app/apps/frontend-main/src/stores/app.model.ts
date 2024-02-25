import { createModel } from '@rematch/core';
import { RootModel } from './models';
import { v4 as uuidV4 } from 'uuid';

export interface Toast {
  uuid: string;
  type: 'info' | 'success' | 'error';
  message: string;
}

interface AppState {
  menuBack: boolean;
  toasts: Toast[];
  _toastState: string;
}

export const app = createModel<RootModel>()({
  state: {
    menuBack: false,
    toasts: [],
    _toastState: null,
  },

  reducers: {
    setMenuBack: (state: AppState, link: boolean) => {
      state.menuBack = link;
      return state;
    },

    toastAdd: (state: AppState, toast: Toast) => {
      state.toasts.push(toast);
      state._toastState = toast.uuid;
      return state;
    },

    toastRemove: (state: AppState, uuid: string) => {
      state.toasts = state.toasts.filter(item => item.uuid !== uuid);
      return state;
    },
  },

  effects: (dispatch) => ({
    toast(toast: Omit<Toast, 'uuid'>): void {
      const uuid = uuidV4();

      dispatch.app.toastAdd({ uuid, ...toast });
      setTimeout(() => dispatch.app.toastRemove(uuid), 2000);
    },
  }),
});
