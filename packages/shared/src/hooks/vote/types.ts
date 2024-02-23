import { Post, ReadHistoryPost, UserPostVote } from '../../graphql/posts';
import { Origin } from '../../lib/analytics';
import { PostAnalyticsEventFnOptions } from '../../lib/feed';
import { UseMutationMatcher } from '../mutationSubscription/types';

export type ToggleVoteProps = {
  origin: Origin;
  post: (Post | ReadHistoryPost) & { index?: number };
  opts?: PostAnalyticsEventFnOptions;
};

export type VoteProps = {
  id: string;
};

export type UseVotePost = {
  upvotePost: (props: VoteProps) => Promise<void>;
  downvotePost: (props: VoteProps) => Promise<void>;
  cancelPostVote: (props: VoteProps) => Promise<void>;
  toggleUpvote: (props: ToggleVoteProps) => Promise<void>;
  toggleDownvote: (props: ToggleVoteProps) => Promise<void>;
};

export type UseVotePostMutationProps = {
  id: string;
  vote: UserPostVote;
};

export type UseVotePostRollback = () => void;

export type UseVotePostProps = {
  onMutate?: (
    props: UseVotePostMutationProps,
  ) => UseVotePostRollback | undefined;
  variables?: unknown;
};

export const upvoteMutationKey = ['post', 'mutation'];

export const voteMutationMatcher: UseMutationMatcher = ({
  status,
  mutation,
}) => {
  return (
    status === 'success' &&
    mutation?.options?.mutationKey?.toString() === upvoteMutationKey.toString()
  );
};

export const voteMutationHandlers: Record<
  UserPostVote,
  (post: Post | ReadHistoryPost) => Partial<Post>
> = {
  [UserPostVote.Up]: (post) => ({
    numUpvotes: post.numUpvotes + 1,
    userState: {
      ...post?.userState,
      vote: UserPostVote.Up,
    },
  }),
  [UserPostVote.Down]: (post) => ({
    numUpvotes:
      post?.userState?.vote === UserPostVote.Up
        ? post.numUpvotes - 1
        : post.numUpvotes,
    userState: {
      ...post?.userState,
      vote: UserPostVote.Down,
    },
  }),
  [UserPostVote.None]: (post) => ({
    numUpvotes:
      post.userState?.vote === UserPostVote.Up
        ? post.numUpvotes - 1
        : post.numUpvotes,
    userState: {
      ...post?.userState,
      vote: UserPostVote.None,
    },
  }),
};
