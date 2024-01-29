import { Axios } from 'axios';

export const methodsCreator = (axios: Axios) => ({
  auth: (uuid: string, creator: string, check: string) => axios.post(`/creator/auth`, { uuid, creator, check }),
  get: (login: string) => axios.get(`/creator/${login}`),
});
