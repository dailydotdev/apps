import { useMutation } from 'react-query';
import request from 'graphql-request';
import { apiUrl } from '@dailydotdev/shared/src/lib/config';
import {
  ADD_BOOKMARKS_MUTATION,
  REMOVE_BOOKMARK_MUTATION,
} from '../graphql/posts';

type MutateFunc<T> = (variables: T) => Promise<(() => void) | undefined>;
type UseBookmarkPostParams<T> = {
  onBookmarkMutate: MutateFunc<T>;
  onRemoveBookmarkMutate: MutateFunc<T>;
};
type UseBookmarkPostRet<T> = {
  bookmark: (variables: T) => Promise<void>;
  removeBookmark: (variables: T) => Promise<void>;
};

export default function useBookmarkPost<
  T extends { id: string } = { id: string }
>({
  onBookmarkMutate,
  onRemoveBookmarkMutate,
}: UseBookmarkPostParams<T>): UseBookmarkPostRet<T> {
  const { mutateAsync: bookmark } = useMutation<
    void,
    unknown,
    T,
    (() => void) | undefined
  >(
    ({ id }) =>
      request(`${apiUrl}/graphql`, ADD_BOOKMARKS_MUTATION, {
        data: { postIds: [id] },
      }),
    {
      onMutate: onBookmarkMutate,
      onError: (err, _, rollback) => rollback?.(),
    },
  );

  const { mutateAsync: removeBookmark } = useMutation<
    void,
    unknown,
    T,
    (() => void) | undefined
  >(
    ({ id }) =>
      request(`${apiUrl}/graphql`, REMOVE_BOOKMARK_MUTATION, {
        id,
      }),
    {
      onMutate: onRemoveBookmarkMutate,
      onError: (err, _, rollback) => rollback?.(),
    },
  );

  return {
    bookmark,
    removeBookmark,
  };
}
