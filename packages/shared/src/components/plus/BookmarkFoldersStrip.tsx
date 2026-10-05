import type { ReactElement } from 'react';
import React, { useMemo, useSyncExternalStore } from 'react';
import type { InfiniteData, QueryKey } from '@tanstack/react-query';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
import type { FeedData } from '../../graphql/feed';
import { tagTitlesQueryOptions } from '../../graphql/keywords';
import { plusUrl } from '../../lib/constants';
import { LogEvent, TargetId } from '../../lib/log';
import { usePlusSubscription } from '../../hooks/usePlusSubscription';
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
  const feed = useSyncExternalStore(
    (onChange) => queryClient.getQueryCache().subscribe(onChange),
    () => queryClient.getQueryData<InfiniteData<FeedData>>(feedQueryKey),
    () => undefined,
  );
  const loadedPosts = useMemo(
    () => feed?.pages.flatMap((page) => page.page.edges) ?? [],
    [feed],
  );
  const folderTags = useMemo(
    () =>
      getSuggestedFolderTags(loadedPosts.map(({ node }) => node.tags ?? [])),
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

  if (!shouldShow) {
    return null;
  }

  const named = folderTags.slice(0, NAMED_FOLDERS);
  const moreCount = folderTags.length - named.length;

  return (
    <div className="mb-6 flex items-center gap-3 rounded-12 border border-border-subtlest-tertiary py-2 pl-2 pr-1">
      <PlusTile />
      <p className="min-w-0 flex-1 text-text-secondary typo-callout">
        <span className="tablet:hidden">
          Plus sorts your bookmarks into {folderTags.length} folders.
        </span>
        <span className="hidden tablet:inline">
          Plus sorts your bookmarks into folders:{' '}
          {named.map((tag, index) => (
            <React.Fragment key={tag}>
              <span className="font-bold text-text-primary">
                {tagTitles?.[tag] ?? `#${tag}`}
              </span>
              {index < named.length - 1 ? ', ' : ''}
            </React.Fragment>
          ))}
          {moreCount > 0 ? ` and ${moreCount} more.` : '.'}
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
