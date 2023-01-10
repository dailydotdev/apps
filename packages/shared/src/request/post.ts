import request from 'graphql-request';
import { useMutation } from 'react-query';
import { EmptyResponse } from '../graphql/emptyResponse';
import { BAN_POST_MUTATION, DELETE_POST_MUTATION } from '../graphql/posts';
import { apiUrl } from '../lib/config';

export const banPost = (id: string): Promise<EmptyResponse> => {
  const { mutateAsync: banPostRequest } = useMutation<EmptyResponse>(() =>
    request(`${apiUrl}/graphql`, BAN_POST_MUTATION, {
      id,
    }),
  );
  return banPostRequest();
};

export const deletePost = (id: string): Promise<EmptyResponse> => {
  const { mutateAsync: deletePostRequest } = useMutation<EmptyResponse>(() =>
    request(`${apiUrl}/graphql`, DELETE_POST_MUTATION, {
      id,
    }),
  );
  return deletePostRequest();
};
