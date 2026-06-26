import type { ReactElement } from 'react';
import React, { useCallback, useMemo, useState } from 'react';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../components/typography/Typography';
import {
  ArrowIcon,
  BriefGradientIcon,
  MegaphoneIcon,
  SettingsIcon,
} from '../../components/icons';
import { IconSize } from '../../components/Icon';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../components/buttons/Button';
import { ElementPlaceholder } from '../../components/ElementPlaceholder';
import { BookmarkButton } from '../../components/buttons/BookmarkButton';
import Link from '../../components/utilities/Link';
import { useBookmarkPost } from '../../hooks/useBookmarkPost';
import type { UseVotePostProps } from '../../hooks/vote/types';
import { useUpdateQuery } from '../../hooks/useUpdateQuery';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent, Origin } from '../../lib/log';
import { feedLogExtra, postLogEvent } from '../../lib/feed';
import useLogImpression from '../../hooks/feed/useLogImpression';
import { FeedItemType } from '../../components/cards/common/common';
import type { Post } from '../../graphql/posts';
import { PostType } from '../../graphql/posts';
import {
  channelConfigurationsQueryOptions,
  dailyHeadlinesQueryOptions,
} from '../../graphql/highlights';
import { HeadlinesSettingsModal } from './HeadlinesSettingsModal';
import { DailyPostVotes } from './DailyPostVotes';
import type { UpdateDailyPost } from './optimisticMutations';
import {
  createBookmarkOnMutate,
  createVoteOnMutate,
} from './optimisticMutations';

// channelConfigurations.color holds the full Tailwind text class per channel.
const DEFAULT_COLOR_CLASS = 'text-text-tertiary';
const DAILY_FEED_NAME = 'daily';

// Headlines is a single-column list, so grid position is always column 0 of 1.
const dailyFeedExtra = () =>
  feedLogExtra(DAILY_FEED_NAME, undefined, undefined, Origin.DailyPage);

const HeadlineRow = ({
  highlight,
  channelName,
  colorClass,
  position,
  onExpand,
  onBookmark,
  onVoteMutate,
}: {
  highlight: Post;
  channelName: string;
  colorClass: string;
  position: number;
  onExpand: () => void;
  onBookmark: () => void;
  onVoteMutate: UseVotePostProps['onMutate'];
}): ReactElement => {
  const [isExpanded, setIsExpanded] = useState(false);
  const summary = highlight.summary || highlight.sharedPost?.summary;
  const panelId = `daily-headline-${highlight.id}`;
  const impressionRef = useLogImpression(
    {
      type: FeedItemType.Post,
      post: highlight,
      page: 0,
      index: position,
      dataUpdatedAt: 0,
    },
    position,
    1,
    0,
    position,
    DAILY_FEED_NAME,
    undefined,
    undefined,
    Origin.DailyPage,
  );

  const onToggle = () => {
    const willOpen = !isExpanded;
    setIsExpanded(willOpen);
    if (willOpen) {
      onExpand();
    }
  };

  return (
    <li ref={impressionRef}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        aria-controls={panelId}
        className={classNames(
          'group flex w-full items-center gap-4 px-4 py-4 text-left transition-colors tablet:px-5',
          !isExpanded && 'hover:bg-surface-float',
        )}
      >
        <div className="flex min-w-0 max-w-3xl flex-1 flex-col gap-1">
          <Typography
            type={TypographyType.Caption1}
            bold
            className={classNames('capitalize', colorClass)}
          >
            {channelName}
          </Typography>
          <Typography
            tag={TypographyTag.H3}
            type={TypographyType.Body}
            bold
            color={TypographyColor.Primary}
            className="!leading-snug"
          >
            {highlight.title}
          </Typography>
        </div>
        <ArrowIcon
          size={IconSize.XSmall}
          className={classNames(
            'ml-auto shrink-0 text-text-quaternary transition-transform duration-300 ease-out',
            isExpanded ? 'rotate-0' : 'rotate-180',
          )}
          aria-hidden
        />
      </button>
      {isExpanded ? (
        <div id={panelId} className="flex flex-col gap-3 px-4 pb-4 tablet:px-5">
          {summary ? (
            <Typography
              type={TypographyType.Body}
              color={TypographyColor.Primary}
              className="max-w-3xl !leading-relaxed"
            >
              {summary}
            </Typography>
          ) : null}
          <div className="mt-1 flex w-full flex-wrap items-center justify-between gap-3">
            <Link href={highlight.commentsPermalink} passHref>
              <a
                href={highlight.commentsPermalink}
                className="font-bold text-text-link typo-footnote hover:underline"
              >
                Read more
              </a>
            </Link>
            <div className="ml-auto flex items-center gap-1">
              <BookmarkButton
                post={highlight}
                iconSize={IconSize.Small}
                buttonProps={{
                  size: ButtonSize.Small,
                  onClick: onBookmark,
                }}
              />
              <DailyPostVotes
                post={highlight}
                origin={Origin.DailyPage}
                opts={{
                  columns: 1,
                  column: 0,
                  row: position,
                  ...dailyFeedExtra(),
                }}
                onMutate={onVoteMutate}
              />
            </div>
          </div>
        </div>
      ) : null}
    </li>
  );
};

// The latest brief rides in `dailyHeadlines` as a `PostType.Brief` edge (Plus +
// subscribed, gated server-side). It renders as the lead row of the list with
// brief branding instead of a channel label, and no vote/bookmark actions.
const BriefHeadlineRow = ({
  brief,
  position,
  onExpand,
}: {
  brief: Post;
  position: number;
  onExpand: () => void;
}): ReactElement => {
  const [isExpanded, setIsExpanded] = useState(false);
  const summary =
    brief.summary ||
    brief.sharedPost?.summary ||
    'A daily briefing of what matters, generated just for you based on your preferences and interests.';
  const panelId = `daily-brief-${brief.id}`;
  const impressionRef = useLogImpression(
    {
      type: FeedItemType.Post,
      post: brief,
      page: 0,
      index: position,
      dataUpdatedAt: 0,
    },
    position,
    1,
    0,
    position,
    DAILY_FEED_NAME,
    undefined,
    undefined,
    Origin.DailyPage,
  );

  const onToggle = () => {
    const willOpen = !isExpanded;
    setIsExpanded(willOpen);
    if (willOpen) {
      onExpand();
    }
  };

  return (
    <li ref={impressionRef}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        aria-controls={panelId}
        className={classNames(
          'group flex w-full items-center gap-4 px-4 py-4 text-left transition-colors tablet:px-5',
          !isExpanded && 'hover:bg-surface-float',
        )}
      >
        <div className="flex min-w-0 max-w-3xl flex-1 flex-col gap-1">
          <span className="flex items-center gap-1">
            <BriefGradientIcon size={IconSize.XSmall} />
            <Typography
              type={TypographyType.Caption1}
              bold
              className="text-brand-default"
            >
              Your briefing
            </Typography>
          </span>
          <Typography
            tag={TypographyTag.H3}
            type={TypographyType.Body}
            bold
            color={TypographyColor.Primary}
            className="!leading-snug"
          >
            {brief.title}
          </Typography>
        </div>
        <ArrowIcon
          size={IconSize.XSmall}
          className={classNames(
            'ml-auto shrink-0 text-text-quaternary transition-transform duration-300 ease-out',
            isExpanded ? 'rotate-0' : 'rotate-180',
          )}
          aria-hidden
        />
      </button>
      {isExpanded ? (
        <div id={panelId} className="flex flex-col gap-3 px-4 pb-4 tablet:px-5">
          {summary ? (
            <Typography
              type={TypographyType.Body}
              color={TypographyColor.Primary}
              className="max-w-3xl !leading-relaxed"
            >
              {summary}
            </Typography>
          ) : null}
          <Link href={brief.commentsPermalink} passHref>
            <a
              href={brief.commentsPermalink}
              className="font-bold text-text-link typo-footnote hover:underline"
            >
              Read briefing
            </a>
          </Link>
        </div>
      ) : null}
    </li>
  );
};

const HEADLINES_PLACEHOLDER_COUNT = 5;

const HeadlineRowSkeleton = (): ReactElement => (
  <li className="flex w-full items-center gap-4 px-4 py-4 tablet:px-5">
    <div className="flex min-w-0 max-w-3xl flex-1 flex-col gap-1.5">
      <ElementPlaceholder className="h-3 w-20 rounded-6" />
      <ElementPlaceholder className="h-5 w-3/4 rounded-8" />
    </div>
  </li>
);

export const CoverTopics = (): ReactElement => {
  const { logEvent } = useLogContext();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { data, isPending } = useQuery(dailyHeadlinesQueryOptions());
  const { data: channelData } = useQuery(channelConfigurationsQueryOptions());
  const [getHeadlines, setHeadlines] = useUpdateQuery(
    dailyHeadlinesQueryOptions(),
  );

  const updatePost = useCallback<UpdateDailyPost>(
    (postId, manipulate) => {
      const current = getHeadlines();

      if (!current) {
        return;
      }

      current.dailyHeadlines.edges.forEach((edge) => {
        if (edge.node.id === postId) {
          Object.assign(edge.node, manipulate(edge.node));
        }
      });

      setHeadlines(current);
    },
    [getHeadlines, setHeadlines],
  );

  const onVoteMutate = useMemo(
    () => createVoteOnMutate(updatePost),
    [updatePost],
  );
  const onBookmarkMutate = useMemo(
    () => createBookmarkOnMutate(updatePost),
    [updatePost],
  );
  const { toggleBookmark } = useBookmarkPost({ onMutate: onBookmarkMutate });

  const channelBySourceId = useMemo(
    () =>
      new Map(
        (channelData?.channelConfigurations ?? []).flatMap((channel) => {
          const sourceId = channel.digest?.source?.id;
          return sourceId ? [[sourceId, channel] as const] : [];
        }),
      ),
    [channelData],
  );

  const highlights = useMemo(
    () => data?.dailyHeadlines.edges.map((edge) => edge.node) ?? [],
    [data],
  );

  const onHeadlineClick = (post: Post, position: number) => {
    logEvent(
      postLogEvent(LogEvent.Click, post, {
        columns: 1,
        column: 0,
        row: position,
        ...dailyFeedExtra(),
      }),
    );
  };

  const onHeadlineBookmark = (post: Post, position: number) => {
    toggleBookmark({
      post,
      origin: Origin.DailyPage,
      opts: {
        columns: 1,
        column: 0,
        row: position,
        ...dailyFeedExtra(),
      },
    });
  };

  return (
    <section>
      <div className="mb-3 flex items-center gap-2 px-1">
        <MegaphoneIcon
          size={IconSize.Small}
          className="text-accent-water-default"
          secondary
        />
        <Typography
          type={TypographyType.Body}
          color={TypographyColor.Secondary}
        >
          Headlines
        </Typography>
        <Button
          type="button"
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          icon={<SettingsIcon />}
          onClick={() => setIsSettingsOpen(true)}
          aria-label="Manage Headlines subscriptions"
          className="ml-auto"
        />
      </div>
      {isPending && (
        <ol className="-mx-4 divide-y divide-border-subtlest-quaternary overflow-hidden bg-background-default tablet:mx-0 tablet:rounded-12 tablet:border tablet:border-border-subtlest-quaternary">
          {Array.from({ length: HEADLINES_PLACEHOLDER_COUNT }, (_, i) => i).map(
            (i) => (
              <HeadlineRowSkeleton key={`headline-skeleton-${i}`} />
            ),
          )}
        </ol>
      )}
      {!isPending && highlights.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-12 border border-border-subtlest-quaternary px-6 py-5 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-accent-water-flat text-accent-water-default">
            <MegaphoneIcon size={IconSize.Medium} secondary />
          </div>
          <div className="flex max-w-xs flex-col items-center gap-1">
            <Typography
              tag={TypographyTag.H3}
              type={TypographyType.Body}
              bold
              color={TypographyColor.Primary}
            >
              No headlines, yet...
            </Typography>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              Follow more topic channels and your daily headlines will show up
              here.
            </Typography>
          </div>
          <Button
            type="button"
            variant={ButtonVariant.Secondary}
            size={ButtonSize.Small}
            icon={<SettingsIcon />}
            onClick={() => setIsSettingsOpen(true)}
          >
            Manage channels
          </Button>
        </div>
      )}
      {highlights.length > 0 && (
        <ol className="-mx-4 divide-y divide-border-subtlest-quaternary overflow-hidden bg-background-default tablet:mx-0 tablet:rounded-12 tablet:border tablet:border-border-subtlest-quaternary">
          {highlights.map((highlight, index) => {
            if (highlight.type === PostType.Brief) {
              return (
                <BriefHeadlineRow
                  key={highlight.id}
                  brief={highlight}
                  position={index}
                  onExpand={() => onHeadlineClick(highlight, index)}
                />
              );
            }

            const sourceId = highlight.source?.id;
            const config = sourceId
              ? channelBySourceId.get(sourceId)
              : undefined;
            return (
              <HeadlineRow
                key={highlight.id}
                highlight={highlight}
                channelName={
                  config?.displayName ?? highlight.source?.name ?? ''
                }
                colorClass={config?.color || DEFAULT_COLOR_CLASS}
                position={index}
                onExpand={() => onHeadlineClick(highlight, index)}
                onBookmark={() => onHeadlineBookmark(highlight, index)}
                onVoteMutate={onVoteMutate}
              />
            );
          })}
        </ol>
      )}
      {isSettingsOpen ? (
        <HeadlinesSettingsModal
          isOpen
          onRequestClose={() => setIsSettingsOpen(false)}
        />
      ) : null}
    </section>
  );
};
