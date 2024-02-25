import { Axios } from 'axios';
import { Creator, Subscription } from '@fans/types';
import { Dispatch, SetStateAction } from 'react';

type QueryPayload = {
  data: {
    login: string
    level?: number
  }
  onSettled?: (() => void) | void
  onSuccess?: () => void
  setIsLoading?: Dispatch<SetStateAction<boolean>>
}

export const methodsSubscription = (axios: Axios) => ({
  getForUser: (): Promise<{ listOfCreators: Creator[], count: number }> => axios.get('/subscription'),
  getOne: (login: string): Promise<Subscription> => axios.get(`/subscription/${login}`),
  change: ({ data } : QueryPayload): Promise<{subscription?: boolean, level?: number}> => axios.patch(`/subscription/${data.login}`, { level: data.level }),
  notification: ({ data } : QueryPayload): Promise<Subscription> => axios.patch(`/subscription/${data.login}/notification`),
});
