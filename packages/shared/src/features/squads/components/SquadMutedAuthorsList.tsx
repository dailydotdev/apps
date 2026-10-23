import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import type { Squad } from '../../../graphql/sources';
import {
  sourceMutedAuthorsQueryOptions,
  unmuteSourceAuthor,
} from '../../../graphql/squads';
import { useAuthContext } from '../../../contexts/AuthContext';
import { getSquadId } from '../lib/features';
import { useLogContext } from '../../../contexts/LogContext';
import { useToastNotification } from '../../../hooks/useToastNotification';
import { generateQueryKey, RequestKey } from '../../../lib/query';
import { LogEvent, Origin, TargetType } from '../../../lib/log';
import { cloudinaryCharmEmptySquads } from '../../../lib/image';
import UserList from '../../../components/profile/UserList';
import { checkFetchMore } from '../../../components/containers/InfiniteScrolling';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import {
  CharmEmptyState,
  CharmEmptyStatePlacement,
} from '../../../components/charm/CharmEmptyState';

// Authors whose posts skip the review queue; unmuting brings their pending
// posts back into it.
export const SquadMutedAuthorsList = ({
  squad,
}: {
  squad: Squad;
}): ReactElement => {
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
  const { displayToast } = useToastNotification();
  const queryClient = useQueryClient();
  const sourceId = getSquadId(squad);
  const queryOptions = sourceMutedAuthorsQueryOptions({ sourceId, user });
  const query = useInfiniteQuery(queryOptions);
  const users = useMemo(
    () =>
      query.data?.pages.flatMap(({ edges }) =>
        edges.map(({ node }) => node.user),
      ) ?? [],
    [query.data],
  );

  const { mutate: onUnmute, isPending } = useMutation({
    mutationFn: (userId: string) => unmuteSourceAuthor({ sourceId, userId }),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: queryOptions.queryKey });
      queryClient.invalidateQueries({
        queryKey: generateQueryKey(RequestKey.SquadPostRequests, user),
      });
      queryClient.invalidateQueries({
        queryKey: generateQueryKey(RequestKey.Squad, user, squad.handle),
      });
      displayToast('Unmuted. Their pending posts are back in the queue.');
      logEvent({
        event_name: LogEvent.UnmuteSquadAuthor,
        target_type: TargetType.Source,
        target_id: sourceId,
        extra: JSON.stringify({ user_id: userId }),
      });
    },
    onError: () => displayToast("Couldn't unmute. Please try again."),
  });

  return (
    <UserList
      users={users}
      isLoading={query.isPending}
      placeholderAmount={3}
      scrollingProps={{
        isFetchingNextPage: query.isFetchingNextPage,
        canFetchMore: checkFetchMore(query),
        fetchNextPage: query.fetchNextPage,
      }}
      emptyPlaceholder={
        <CharmEmptyState
          placement={CharmEmptyStatePlacement.Page}
          image={cloudinaryCharmEmptySquads}
          imageAlt="daily.dev charm waving in an empty squad"
          title="No muted authors"
          description="Posts from authors you mute skip the review queue and stay pending until you unmute them."
        />
      }
      afterContent={(author) => (
        <Button
          className="relative z-1 my-auto ml-2"
          size={ButtonSize.Small}
          variant={ButtonVariant.Float}
          disabled={isPending}
          onClick={() => onUnmute(author.id)}
        >
          Unmute
        </Button>
      )}
      userInfoProps={{
        origin: Origin.SquadMembersList,
        showFollow: false,
        showSubscribe: false,
      }}
    />
  );
};
