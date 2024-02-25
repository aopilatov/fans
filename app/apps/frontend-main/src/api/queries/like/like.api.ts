import { Axios } from 'axios';

type QueryPayload = {
  uuid: string
  onSuccess: any
  newIsLiked: boolean
}

export const methodsLike = (axios: Axios) => ({
  set: ({ uuid }: QueryPayload) => axios.patch<{
    postUuid: string,
    isLiked: boolean
  }>(`/like/${uuid}`),
});
