import type { ReactElement } from 'react';
import React, { useCallback, useMemo, useSyncExternalStore } from 'react';
import type { InfiniteData, QueryKey } from '@tanstack/react-query';
import { hashKey, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from '../utilities/Link';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../buttons/Button';
import CloseButton from '../CloseButton';
import { DevPlusIcon } from '../icons/DevPlus';
import { PlusTile } from './PlusPreview';
import type { FeedItemData } from '../../graphql/feed';
import { getFeedApiItemPost } from '../../graphql/feed';
import { tagTitlesQueryOptions } from '../../graphql/keywords';
import { plusUrl } from '../../lib/constants';
import { LogEvent, TargetId, TargetType } from '../../lib/log';
import { usePlusSubscription } from '../../hooks/usePlusSubscription';
import useLogEventOnce from '../../hooks/log/useLogEventOnce';
import usePersistentContext, {
  PersistentContextKeys,
} from '../../hooks/usePersistentContext';

const MIN_LOADED_BOOKMARKS = 10;
const MIN_POSTS_PER_FOLDER = 2;
const MIN_FOLDERS = 2;
const NAMED_FOLDERS = 3;
const DISMISS_DAYS = 30;

interface BookmarkFoldersStripProps {
  feedQueryKey: QueryKey;
}

export const getSuggestedFolderTags = (tagsPerPost: string[][]): string[] => {
  const counts = new Map<string, number>();
  tagsPerPost.forEach((tags) =>
    tags.forEach((tag) => counts.set(tag, (counts.get(tag) ?? 0) + 1)),
  );

  return [...counts.entries()]
    .filter(([, count]) => count >= MIN_POSTS_PER_FOLDER)
    .sort(([, a], [, b]) => b - a)
    .map(([tag]) => tag);
};

export const BookmarkFoldersStrip = ({
  feedQueryKey,
}: BookmarkFoldersStripProps): ReactElement | null => {
  const { isPlus, logSubscriptionEvent } = usePlusSubscription();
  const [dismissedAt, setDismissedAt, isDismissLoaded] = usePersistentContext<
    number | null
  >(PersistentContextKeys.BookmarkFoldersStripDismissedAt, null);
  const queryClient = useQueryClient();
  const feedHash = useMemo(() => hashKey(feedQueryKey), [feedQueryKey]);
  const subscribeToFeed = useCallback(
    (onChange: () => void) =>
      queryClient.getQueryCache().subscribe((event) => {
        if (event.query.queryHash === feedHash) {
          onChange();
        }
      }),
    [queryClient, feedHash],
  );
  const feed = useSyncExternalStore(
    subscribeToFeed,
    () => queryClient.getQueryData<InfiniteData<FeedItemData>>(feedQueryKey),
    () => undefined,
  );
  const loadedPosts = useMemo(
    () =>
      feed?.pages.flatMap((page) =>
        page.page.edges.flatMap(({ node }) => getFeedApiItemPost(node) ?? []),
      ) ?? [],
    [feed],
  );
  const folderTags = useMemo(
    () => getSuggestedFolderTags(loadedPosts.map((post) => post.tags ?? [])),
    [loadedPosts],
  );
  const isDismissed =
    !!dismissedAt &&
    Date.now() - dismissedAt < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  const shouldShow =
    !isPlus &&
    isDismissLoaded &&
    !isDismissed &&
    loadedPosts.length >= MIN_LOADED_BOOKMARKS &&
    folderTags.length >= MIN_FOLDERS;
  const { data: tagTitles } = useQuery({
    ...tagTitlesQueryOptions(),
    enabled: shouldShow,
  });

  useLogEventOnce(
    () => ({
      event_name: LogEvent.Impression,
      target_type: TargetType.Plus,
      target_id: TargetId.BookmarkFolder,
    }),
    { condition: shouldShow },
  );

  if (!shouldShow) {
    return null;
  }

  const named = folderTags.slice(0, NAMED_FOLDERS);

  return (
    <div className="mb-6 flex items-center gap-3 rounded-12 border border-border-subtlest-tertiary py-2 pl-2 pr-1">
      <PlusTile />
      <p className="min-w-0 flex-1 text-text-secondary typo-callout">
        <span className="tablet:hidden">
          Organize your saves into folders with Plus.
        </span>
        <span className="hidden tablet:inline">
          Organize your saves into folders with Plus, like{' '}
          {named.map((tag, index) => (
            <React.Fragment key={tag}>
              {index > 0 && (index === named.length - 1 ? ' and ' : ', ')}
              <span className="font-bold text-text-primary">
                {tagTitles?.[tag] ?? `#${tag}`}
              </span>
            </React.Fragment>
          ))}
          .
        </span>
      </p>
      <Link href={plusUrl} passHref>
        <Button
          tag="a"
          variant={ButtonVariant.Primary}
          color={ButtonColor.Bacon}
          size={ButtonSize.Small}
          icon={<DevPlusIcon secondary />}
          onClick={() =>
            logSubscriptionEvent({
              event_name: LogEvent.UpgradeSubscription,
              target_id: TargetId.BookmarkFolder,
            })
          }
        >
          Get Plus
        </Button>
      </Link>
      <CloseButton
        size={ButtonSize.Small}
        aria-label="Not now"
        onClick={() => setDismissedAt(Date.now())}
      />
    </div>
  );
};
