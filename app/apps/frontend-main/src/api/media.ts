import { Axios } from 'axios';
import * as FormData from 'form-data';

export const methodsMedia = (axios: Axios) => ({
  image: (data: FormData) => axios.post(`/media/image`, data),
  video: (data: FormData) => axios.post(`/media/video`, data),
});
