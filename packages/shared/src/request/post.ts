import request from 'graphql-request';
import { EmptyResponse } from '../graphql/emptyResponse';
import { BAN_POST_MUTATION, DELETE_POST_MUTATION } from '../graphql/posts';
import { apiUrl } from '../lib/config';

export const banPost = (id: string): Promise<EmptyResponse> => {
  return request(`${apiUrl}/graphql`, BAN_POST_MUTATION, {
    id,
  });
};

export const deletePost = (id: string): Promise<EmptyResponse> => {
  return request(`${apiUrl}/graphql`, DELETE_POST_MUTATION, {
    id,
  });
};
