import { Axios } from 'axios';
import { Dispatch, SetStateAction } from 'react';
import { Creator } from '@fans/types';

type BaseQueryPayload = {
  setIsLoading: Dispatch<SetStateAction<boolean>>,
  onError?: (message: string) => void
}

type AuthQueryPayload = BaseQueryPayload & {
  data: {
    uuid: string,
    creator: string,
    check: string
  },
  url: string
}

type SearchQueryPayload = BaseQueryPayload & {
  search?: string
  setResults: (arg: any) => void
}


export const methodsCreator = (axios: Axios) => ({
  auth: ({ data: { uuid, creator, check } }: AuthQueryPayload): Promise<{token: string}> => axios.post(`/creator/auth`, { uuid, creator, check }),
  get: (login: string): Promise<Creator> => axios.get(`/creator/${login}`),
  search: ({ search = '' }: SearchQueryPayload): Promise<{listOfCreators: Creator[]}> => axios.post(`/creator/search`, { search }),
});
