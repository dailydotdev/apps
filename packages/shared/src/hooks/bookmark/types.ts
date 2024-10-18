import { UseMutationMatcher } from '../mutationSubscription';

export type UseBookmarkMutationProps = {
  id: string;
};

export const bookmarkMutationKey = ['post', 'mutation', 'bookmark'];

export const bookmarkMutationMatcher: UseMutationMatcher<
  Partial<UseBookmarkMutationProps>
> = ({ status, mutation }) =>
  status === 'success' &&
  mutation?.options?.mutationKey
    ?.toString()
    .includes(bookmarkMutationKey.toString());
