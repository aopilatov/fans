import { Axios } from 'axios';

type QueryPayload = {
  uuid: string
  onSuccess: any
  newIsLiked: boolean
}

export const methodsLike = (axios: Axios) => ({
  set: ({ uuid }: QueryPayload): Promise<{postUuid: string, isLiked: boolean}> => axios.patch(`/like/${uuid}`),
});
