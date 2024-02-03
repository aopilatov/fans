import { Axios } from 'axios';

export const methodsSubscription = (axios: Axios) => ({
  getForUser: () => axios.get('/subscription'),
});
