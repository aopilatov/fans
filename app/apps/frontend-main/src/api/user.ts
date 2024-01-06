import { Axios } from 'axios';

export const methodsUser = (axios: Axios) => ({
  auth: (uuid: string, check: string) => axios.post(`/user/auth`, { uuid, check }),
});
