import type { ReactElement } from 'react';
import React, { useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
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
import { feedHighlightsLogEvent } from '../../lib/feed';
import type { PostHighlightFeed } from '../../graphql/highlights';
import {
  channelConfigurationsQueryOptions,
  dailyHighlightsQueryOptions,
} from '../../graphql/highlights';
import { HeadlinesSettingsModal } from './HeadlinesSettingsModal';

// channelConfigurations.color holds the full Tailwind text class per channel.
const DEFAULT_COLOR_CLASS = 'text-text-tertiary';
const DAILY_FEED_NAME = 'daily';

const HeadlineRow = ({
  highlight,
  channelName,
  colorClass,
  position,
  onClick,
}: {
  highlight: PostHighlightFeed;
  channelName: string;
  colorClass: string;
  position: number;
  onClick: () => void;
}): ReactElement => {
  const { logEvent } = useLogContext();
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.5 });

  useEffect(() => {
    if (!inView) {
      return;
    }
    logEvent(
      feedHighlightsLogEvent(LogEvent.Impression, {
        feedName: DAILY_FEED_NAME,
        action: 'impression',
        columns: 1,
        column: 0,
        row: position,
        count: 1,
        highlightIds: [highlight.id],
        origin: Origin.DailyPage,
      }),
    );
  }, [inView, logEvent, highlight.id, position]);

  return (
    <li ref={ref}>
      <Link href={highlight.post.commentsPermalink} passHref>
        <a
          href={highlight.post.commentsPermalink}
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
              {highlight.headline}
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
  const { data, isPending } = useQuery(dailyHighlightsQueryOptions());
  const { data: channelData } = useQuery(channelConfigurationsQueryOptions());

  const channelByKey = useMemo(
    () =>
      new Map(
        (channelData?.channelConfigurations ?? []).map((channel) => [
          channel.channel,
          channel,
        ]),
      ),
    [channelData],
  );

  const highlights = useMemo(
    () => data?.dailyHighlights.edges.map((edge) => edge.node) ?? [],
    [data],
  );

  const onHeadlineClick = (highlight: PostHighlightFeed, position: number) => {
    logEvent(
      feedHighlightsLogEvent(LogEvent.Click, {
        feedName: DAILY_FEED_NAME,
        action: 'highlight_click',
        columns: 1,
        column: 0,
        row: position,
        position: position + 1,
        count: 1,
        clickedHighlight: highlight,
        highlightIds: [highlight.id],
        origin: Origin.DailyPage,
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
            const config = channelByKey.get(highlight.channel);
            return (
              <HeadlineRow
                key={highlight.id}
                highlight={highlight}
                channelName={config?.displayName ?? highlight.channel}
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
