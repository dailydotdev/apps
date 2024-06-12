import { MutationKey } from '@tanstack/react-query';
import {
  Post as PostEntity,
  ReadHistoryPost,
  UserVote,
} from '../../graphql/posts';
import { Origin } from '../../lib/log';
import { PostLogEventFnOptions } from '../../lib/feed';
import { UseMutationMatcher } from '../mutationSubscription/types';

export type VoteEntityPayload = {
  id: string;
  numUpvotes?: number;
  userState?: {
    vote: UserVote;
  };
};

export type ToggleVoteProps<T extends VoteEntityPayload = VoteEntityPayload> = {
  origin: Origin;
  payload: T;
  opts?: PostLogEventFnOptions;
};

export type VoteProps = {
  id: string;
};

export type UseVote<T extends VoteEntityPayload = VoteEntityPayload> = {
  upvote: (props: VoteProps) => Promise<void>;
  downvote: (props: VoteProps) => Promise<void>;
  cancelVote: (props: VoteProps) => Promise<void>;
  toggleUpvote: (props: ToggleVoteProps<T>) => Promise<void>;
  toggleDownvote: (props: ToggleVoteProps<T>) => Promise<void>;
};

export type UseVotePost = {
  upvotePost: UseVote['upvote'];
  downvotePost: UseVote['downvote'];
  cancelPostVote: UseVote['cancelVote'];
  toggleUpvote: (
    props: Omit<ToggleVoteProps<PostEntity | ReadHistoryPost>, 'entity'>,
  ) => Promise<void>;
  toggleDownvote: (
    props: Omit<ToggleVoteProps<PostEntity | ReadHistoryPost>, 'entity'>,
  ) => Promise<void>;
};

export enum UserVoteEntity {
  Comment = 'comment',
  Post = 'post',
}

export type UseVoteMutationProps = {
  id: string;
  entity: UserVoteEntity;
  vote: UserVote;
};

export type UseVotePostRollback = () => void;

export type UseVoteProps = {
  entity: UserVoteEntity;
  onMutate?: (props: UseVoteMutationProps) => UseVotePostRollback | undefined;
  variables?: unknown;
};

export type UseVotePostProps = {
  variables?: unknown;
} & Pick<UseVoteProps, 'onMutate'>;

export const createVoteMutationKey = ({
  entity,
  variables,
}: {
  entity: UserVoteEntity;
  variables?: unknown;
}): MutationKey => {
  const base = [entity, 'mutation', 'vote'];

  return variables ? [...base, variables] : base;
};

export const voteMutationMatcher: UseMutationMatcher<
  Partial<UseVoteMutationProps>
> = ({ status, mutation, variables }) => {
  const entity = variables?.entity;

  if (!entity) {
    return false;
  }

  return (
    status === 'success' &&
    mutation?.options?.mutationKey?.toString() ===
      createVoteMutationKey({ entity }).toString()
  );
};

export const voteMutationHandlers: Record<
  UserVote,
  (payload: VoteEntityPayload) => Partial<VoteEntityPayload>
> = {
  [UserVote.Up]: (payload) => ({
    numUpvotes: payload.numUpvotes + 1,
    userState: {
      ...payload?.userState,
      vote: UserVote.Up,
    },
  }),
  [UserVote.Down]: (payload) => ({
    numUpvotes:
      payload?.userState?.vote === UserVote.Up
        ? payload.numUpvotes - 1
        : payload.numUpvotes,
    userState: {
      ...payload?.userState,
      vote: UserVote.Down,
    },
  }),
  [UserVote.None]: (payload) => ({
    numUpvotes:
      payload.userState?.vote === UserVote.Up
        ? payload.numUpvotes - 1
        : payload.numUpvotes,
    userState: {
      ...payload?.userState,
      vote: UserVote.None,
    },
  }),
};
