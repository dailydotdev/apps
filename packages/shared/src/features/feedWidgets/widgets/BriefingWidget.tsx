import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useLogContext } from '../../../contexts/LogContext';
import { usePlusSubscription } from '../../../hooks/usePlusSubscription';
import useLogEventOnce from '../../../hooks/log/useLogEventOnce';
import { LogEvent, Origin } from '../../../lib/log';
import { getPostPath } from '../../../lib/links';
import { webappUrl } from '../../../lib/constants';
import type { Post } from '../../../graphql/posts';
import { latestBriefingQueryOptions } from '../../../graphql/posts';
import useOnPostClick from '../../../hooks/useOnPostClick';
import Link from '../../../components/utilities/Link';
import { IconSize } from '../../../components/Icon';
import { ArrowIcon } from '../../../components/icons/Arrow';
import { BriefGradientIcon } from '../../../components/icons/BriefGradient';
import { Pill, PillSize } from '../../../components/Pill';
import { getBriefKeyPoints } from '../../briefing/briefBodyBlocks';
import type { FeedWidgetComponentProps } from '../registry';
import { FeedWidgetKind, FeedWidgetSize } from '../types';
import { useFeedWidgetsContext } from '../FeedWidgetsContext';
import { FeedWidgetEmpty } from '../FeedWidgetFrame';

const keyPointsBySize: Record<FeedWidgetSize, number> = {
  [FeedWidgetSize.Small]: 0,
  [FeedWidgetSize.Tall]: 3,
  [FeedWidgetSize.Large]: 4,
};

/**
 * The reader's newest presidential briefing: its date, the TL;DR and the
 * claims it leads with, opening the full brief. Briefs are readable without
 * Plus (the brief itself carries the upgrade alert), so the widget only needs
 * an account.
 */
export const BriefingWidget = ({
  size,
}: FeedWidgetComponentProps<FeedWidgetKind.Briefing>): ReactElement => {
  const { user } = useAuthContext();
  const { isPlus } = usePlusSubscription();
  const { feedName } = useFeedWidgetsContext();
  const { logEvent } = useLogContext();
  const onPostClick = useOnPostClick({ origin: Origin.FeedWidgets, feedName });
  const { data: brief, isPending } = useQuery(latestBriefingQueryOptions(user));
  const keyPoints = useMemo(
    () => getBriefKeyPoints(brief?.contentHtml).slice(0, keyPointsBySize[size]),
    [brief?.contentHtml, size],
  );

  const briefExtra = () =>
    JSON.stringify({
      is_demo: !isPlus,
      brief_date: brief?.createdAt,
      origin: Origin.FeedWidgets,
    });

  useLogEventOnce(
    () => ({ event_name: LogEvent.ImpressionBrief, extra: briefExtra() }),
    { condition: !!brief },
  );

  if (!brief) {
    if (isPending && !!user) {
      return (
        <FeedWidgetEmpty kind={FeedWidgetKind.Briefing} isPending message="" />
      );
    }

    return (
      <Link href={`${webappUrl}briefing`}>
        <a
          href={`${webappUrl}briefing`}
          className="flex flex-1 flex-col items-center justify-center gap-2 px-4 text-center text-text-tertiary hover:text-text-primary"
        >
          <BriefGradientIcon secondary size={IconSize.Large} />
          <span className="typo-footnote">
            No briefing yet. Get your first one.
          </span>
        </a>
      </Link>
    );
  }

  const isSmall = size === FeedWidgetSize.Small;
  const href = getPostPath(brief);

  return (
    <Link href={href}>
      <a
        href={href}
        className="group flex min-h-0 min-w-0 flex-1 flex-col gap-3 px-4"
        data-size={size}
        onClick={() => {
          onPostClick({ post: brief as Post });
          logEvent({ event_name: LogEvent.ClickBrief, extra: briefExtra() });
        }}
      >
        <span className="flex min-w-0 items-center gap-2">
          <BriefGradientIcon secondary size={IconSize.Medium} />
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-text-tertiary typo-caption1">
              Presidential briefing
            </span>
            <span className="truncate font-bold text-text-primary typo-callout">
              {brief.title}
            </span>
          </span>
          {!brief.read && (
            <Pill
              label="Just in"
              size={PillSize.XSmall}
              alignment="self-center"
              className="invert bg-accent-bacon-default text-text-primary"
            />
          )}
        </span>
        {!!brief.summary && (
          <span
            className={
              isSmall
                ? 'line-clamp-2 text-text-secondary typo-footnote'
                : 'line-clamp-4 text-text-secondary typo-callout'
            }
          >
            {brief.summary}
          </span>
        )}
        {keyPoints.length > 0 && (
          <ul className="flex min-h-0 shrink flex-col gap-2 overflow-hidden">
            {keyPoints.map((point) => (
              <li
                key={point}
                className="line-clamp-2 border-l-2 border-accent-bacon-default pl-2 text-text-primary typo-footnote"
              >
                {point}
              </li>
            ))}
          </ul>
        )}
        <span className="mt-auto flex items-center justify-between gap-2 text-text-tertiary typo-footnote">
          <span className="truncate">
            {[
              !!brief.readTime && `${brief.readTime}m read`,
              !!brief.flags?.posts && `${brief.flags.posts} posts`,
            ]
              .filter(Boolean)
              .join(' • ')}
          </span>
          <span className="flex shrink-0 items-center gap-1 font-bold text-text-primary group-hover:underline">
            Read briefing
            <ArrowIcon className="rotate-90" size={IconSize.XSmall} />
          </span>
        </span>
      </a>
    </Link>
  );
};
