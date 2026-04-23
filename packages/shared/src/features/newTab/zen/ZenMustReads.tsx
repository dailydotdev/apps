import type { ReactElement } from 'react';
import React, { useCallback, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import classNames from 'classnames';
import { gqlClient } from '../../../graphql/common';
import { ANONYMOUS_FEED_QUERY } from '../../../graphql/feed';
import type { FeedData } from '../../../graphql/feed';
import type { Post } from '../../../graphql/posts';
import AuthContext from '../../../contexts/AuthContext';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetType } from '../../../lib/log';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { ArrowIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { useNewTabMode } from '../store/newTabMode.store';

const MUST_READS_LIMIT = 3;
const FOUR_HOURS_MS = 4 * 60 * 60 * 1000;

type MustReadPost = Pick<
  Post,
  'id' | 'title' | 'permalink' | 'commentsPermalink' | 'readTime' | 'source'
>;

interface MustReadsCardProps {
  post: MustReadPost;
  position: number;
  onClick: (post: MustReadPost, position: number) => void;
}

const MustReadsCard = ({
  post,
  position,
  onClick,
}: MustReadsCardProps): ReactElement => {
  const sourceName = post.source?.name;
  return (
    <a
      href={post.commentsPermalink}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => onClick(post, position)}
      className={classNames(
        'flex flex-1 flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4',
        'transition-colors hover:border-border-subtlest-secondary hover:bg-surface-secondary',
      )}
    >
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
      >
        {position + 1}
      </Typography>
      <Typography
        type={TypographyType.Title3}
        bold
        className="line-clamp-3 text-balance"
      >
        {post.title}
      </Typography>
      <div className="mt-auto flex items-center justify-between gap-2">
        {sourceName && (
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
            className="truncate"
          >
            {sourceName}
          </Typography>
        )}
        {post.readTime ? (
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Quaternary}
          >
            {post.readTime} min read
          </Typography>
        ) : null}
      </div>
    </a>
  );
};

const LoadingCard = (): ReactElement => (
  <div className="flex flex-1 flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4">
    <div className="h-3 w-3 animate-pulse rounded-full bg-surface-secondary" />
    <div className="h-5 w-full animate-pulse rounded-4 bg-surface-secondary" />
    <div className="h-5 w-4/5 animate-pulse rounded-4 bg-surface-secondary" />
    <div className="mt-auto h-3 w-1/3 animate-pulse rounded-4 bg-surface-secondary" />
  </div>
);

export const ZenMustReads = (): ReactElement => {
  const { isLoggedIn, user } = useContext(AuthContext);
  const { logEvent } = useLogContext();
  const { setMode } = useNewTabMode();

  // Cached aggressively: Zen should feel static, not reactive. Four hours
  // matches what most users consider "this morning's news."
  const { data, isLoading } = useQuery<FeedData>({
    queryKey: ['zen_must_reads', user?.id ?? 'anon'],
    queryFn: () =>
      gqlClient.request<FeedData>(ANONYMOUS_FEED_QUERY, {
        first: MUST_READS_LIMIT,
        loggedIn: isLoggedIn,
      }),
    staleTime: FOUR_HOURS_MS,
    gcTime: FOUR_HOURS_MS,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const posts: MustReadPost[] =
    data?.page?.edges
      ?.slice(0, MUST_READS_LIMIT)
      .map((edge) => edge.node)
      .filter((post): post is Post => !!post?.id) ?? [];

  const onCardClick = useCallback(
    (post: MustReadPost, position: number) => {
      logEvent({
        event_name: LogEvent.Click,
        target_type: TargetType.CustomizeNewTab,
        target_id: 'mustread_click',
        extra: JSON.stringify({ post_id: post.id, position }),
      });
    },
    [logEvent],
  );

  const onOpenFeed = useCallback(() => {
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.CustomizeNewTab,
      target_id: 'open_full_feed',
    });
    setMode('discover');
  }, [logEvent, setMode]);

  return (
    <section
      aria-label="Today's must-reads"
      className="flex w-full max-w-4xl flex-col gap-4"
    >
      <div className="flex items-center justify-between">
        <Typography
          type={TypographyType.Subhead}
          color={TypographyColor.Tertiary}
        >
          Today&apos;s 3 must-reads
        </Typography>
      </div>
      <div className="grid grid-cols-1 gap-3 tablet:grid-cols-3">
        {isLoading || posts.length === 0
          ? Array.from({ length: MUST_READS_LIMIT }).map((_, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <LoadingCard key={index} />
            ))
          : posts.map((post, index) => (
              <MustReadsCard
                key={post.id}
                post={post}
                position={index}
                onClick={onCardClick}
              />
            ))}
      </div>
      <button
        type="button"
        onClick={onOpenFeed}
        className="flex items-center justify-center gap-1 self-center rounded-8 px-3 py-2 text-text-tertiary transition-colors typo-callout hover:bg-surface-float hover:text-text-primary"
      >
        Open full feed
        <ArrowIcon size={IconSize.Size16} className="rotate-90" />
      </button>
    </section>
  );
};
