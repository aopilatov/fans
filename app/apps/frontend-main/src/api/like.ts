import { Axios } from 'axios';

export const methodsLike = (axios: Axios) => ({
  set: (uuid: string) => axios.patch(`/like/${uuid}`),
});
