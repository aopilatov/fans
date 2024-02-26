import { useMutation } from '@tanstack/react-query';
import api from '@/api';


export function useMediaImage () {
  return useMutation({
    mutationFn: api.media.image,
    onSuccess: (data, { onSuccess, images }) => {
      setTimeout(() => {
        onSuccess(() => [...images, ...(data?.['images'] || [])]);
      }, 2000);
    },
    onSettled: (_, __, { onSettled }) => onSettled(),
  });
}

export function useMediaVideo () {
  return useMutation({
    mutationFn: api.media.video,
    onSuccess: (data, { onSuccess, videos }) => {
          const current = [ ...videos, ...(data?.['videos'] || []) ];
          setTimeout(() => {
            onSuccess(() => current);
          }, 2000);
    },
    onSettled: (_, __, { onSettled }) => onSettled(),
  });
}
