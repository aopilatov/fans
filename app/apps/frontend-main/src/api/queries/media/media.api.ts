import { Axios } from 'axios';
import FormData from 'form-data';

type QueryPayload = {
  data: FormData
  onSettled: () => void
  onSuccess: (data: any) => void
  images?: Record<string, any>[]
  videos?: Record<string, any>[]
}

export const methodsMedia = (axios: Axios) => ({
  image: ({ data }: QueryPayload) => axios.post(`/media/image`, data),
  video: ({ data }: QueryPayload) => axios.post(`/media/video`, data),
});
