import { Axios } from 'axios';

export const methodsCreator = (axios: Axios) => ({
  auth: (uuid: string, creator: string, check: string) => axios.post(`/creator/auth`, { uuid, creator, check }),
  get: (login: string) => axios.get(`/creator/${login}`),
  search: (search: string = '') => axios.post(`/creator/search`, { search }),
});
