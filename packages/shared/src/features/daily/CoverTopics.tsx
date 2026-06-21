import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../components/typography/Typography';
import {
  MegaphoneIcon,
  OpenLinkIcon,
  SettingsIcon,
} from '../../components/icons';
import { IconSize } from '../../components/Icon';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../components/buttons/Button';
import { ElementPlaceholder } from '../../components/ElementPlaceholder';
import Link from '../../components/utilities/Link';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent, Origin } from '../../lib/log';
import { feedLogExtra, postLogEvent } from '../../lib/feed';
import useLogImpression from '../../hooks/feed/useLogImpression';
import { FeedItemType } from '../../components/cards/common/common';
import type { Post } from '../../graphql/posts';
import {
  channelConfigurationsQueryOptions,
  dailyHeadlinesQueryOptions,
} from '../../graphql/highlights';
import { HeadlinesSettingsModal } from './HeadlinesSettingsModal';

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
  onClick,
}: {
  highlight: Post;
  channelName: string;
  colorClass: string;
  position: number;
  onClick: () => void;
}): ReactElement => {
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

  return (
    <li ref={impressionRef}>
      <Link href={highlight.commentsPermalink} passHref>
        <a
          href={highlight.commentsPermalink}
          onClick={onClick}
          className="group flex w-full items-center gap-4 px-4 py-4 text-left transition-colors hover:bg-surface-float tablet:px-5"
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
          <OpenLinkIcon
            size={IconSize.XSmall}
            className="ml-auto shrink-0 text-text-quaternary"
            aria-hidden
          />
        </a>
      </Link>
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
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
          className="px-1 py-2"
        >
          No headlines today, yet...
        </Typography>
      )}
      {highlights.length > 0 && (
        <ol className="-mx-4 divide-y divide-border-subtlest-quaternary overflow-hidden bg-background-default tablet:mx-0 tablet:rounded-12 tablet:border tablet:border-border-subtlest-quaternary">
          {highlights.map((highlight, index) => {
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
                onClick={() => onHeadlineClick(highlight, index)}
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
