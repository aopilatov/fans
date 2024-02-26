import { Axios } from 'axios';
import { Dispatch, SetStateAction } from 'react';

type QueryPayload = {
  data: {
    uuid: string, check: string
  }
  setIsLoading: Dispatch<SetStateAction<boolean>>,
  onError: (message: string) => void
}

export const methodsUser = (axios: Axios) => ({
  auth: ({ data: { uuid, check } }: QueryPayload): Promise<{token: string}> => axios.post(`/user/auth`, { uuid, check }),
  getSelf: (): Promise<{
    subscriptions: {
      count: number
    },
    balances: Record<string, any>[]
  }> => axios.get('/user'),
});
