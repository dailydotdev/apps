import type { ReactElement, ReactNode } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useLogContext } from '../../../contexts/LogContext';
import { usePlusSubscription } from '../../../hooks/usePlusSubscription';
import useLogEventOnce from '../../../hooks/log/useLogEventOnce';
import { LogEvent, Origin, TargetId } from '../../../lib/log';
import { getPostPath } from '../../../lib/links';
import { webappUrl } from '../../../lib/constants';
import type { LatestBriefing, Post } from '../../../graphql/posts';
import { latestBriefingQueryOptions } from '../../../graphql/posts';
import useOnPostClick from '../../../hooks/useOnPostClick';
import Link from '../../../components/utilities/Link';
import { IconSize } from '../../../components/Icon';
import { BriefGradientIcon } from '../../../components/icons/BriefGradient';
import { BriefCardReady } from '../../../components/cards/brief/BriefCard/BriefCardReady';
import { getBriefKeyPoints } from '../../briefing/briefBodyBlocks';
import type { FeedWidgetComponentProps } from '../registry';
import { FeedWidgetKind, FeedWidgetSize } from '../types';
import { useFeedWidgetsContext } from '../FeedWidgetsContext';
import { FeedWidgetEmpty } from '../FeedWidgetFrame';

const BRIEF_CARD_TITLE = 'Presidential briefing';

// Tall and Large render the feed's own brief card edge to edge, so those
// sizes draw no widget surface; the states without a card draw it here.
const surfaceClassName =
  'flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-subtle';

const Label = ({ trailing }: { trailing?: ReactNode }): ReactElement => (
  <span className="flex h-6 min-w-0 shrink-0 items-center gap-1.5">
    <BriefGradientIcon secondary size={IconSize.Size16} />
    <span className="truncate font-bold text-text-primary typo-caption1">
      {BRIEF_CARD_TITLE}
    </span>
    {trailing && (
      <span className="ml-auto flex shrink-0 items-center text-text-tertiary typo-caption1">
        {trailing}
      </span>
    )}
  </span>
);

const KeyPoints = ({ points }: { points: string[] }): ReactElement => (
  <ul className="flex min-h-0 flex-1 flex-col gap-1 overflow-hidden">
    {points.map((point) => (
      <li
        key={point}
        className="-mx-2 rounded-12 px-2 py-1.5 transition-colors duration-150 group-hover:bg-surface-hover motion-reduce:transition-none"
      >
        <span className="line-clamp-2 font-bold text-text-primary typo-footnote">
          {point}
        </span>
      </li>
    ))}
  </ul>
);

/** The production brief card, its outline and inner ring dropped. */
const BriefCard = ({ brief }: { brief: LatestBriefing }): ReactElement => (
  <div className="flex h-full min-h-0 flex-1 [&>*>*]:!border-0 [&>*]:h-full [&>*]:max-h-none [&>*]:flex-1 [&>*]:!border-0">
    <BriefCardReady
      post={{ ...brief, flags: brief.flags ?? {} } as Post}
      title={BRIEF_CARD_TITLE}
      targetId={TargetId.FeedWidgets}
    />
  </div>
);

/**
 * The reader's newest presidential briefing, as the storybook's widget draws
 * it: Small is the label, the brief's title and its Must know claims; Tall is
 * the feed's brief card, filling the cell; Large splits the card and the Must
 * know list. Briefs are readable without Plus (the brief itself carries the
 * upgrade alert), so the widget only needs an account.
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
    () => getBriefKeyPoints(brief?.contentHtml),
    [brief?.contentHtml],
  );
  const isSmall = size === FeedWidgetSize.Small;

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
    const content =
      isPending && !!user ? (
        <FeedWidgetEmpty kind={FeedWidgetKind.Briefing} isPending message="" />
      ) : (
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

    return isSmall ? (
      content
    ) : (
      <div className={classNames(surfaceClassName, 'py-3')}>{content}</div>
    );
  }

  const href = getPostPath(brief as Post);
  const onBriefClick = () => {
    onPostClick({ post: brief as Post });
    logEvent({ event_name: LogEvent.ClickBrief, extra: briefExtra() });
  };

  // The way into the brief from the list half: one link over its rows.
  const listLink = (children: ReactNode, className?: string) => (
    <Link href={href}>
      <a
        href={href}
        onClick={onBriefClick}
        className={classNames(
          'group flex min-h-0 min-w-0 flex-1 flex-col gap-2',
          className,
        )}
      >
        {children}
      </a>
    </Link>
  );

  if (isSmall) {
    return listLink(
      <>
        <Label trailing={!!brief.readTime && `${brief.readTime} min`} />
        <span className="line-clamp-2 font-bold text-text-primary typo-callout">
          {brief.title}
        </span>
        <KeyPoints points={keyPoints.slice(0, 3)} />
      </>,
      'px-4',
    );
  }

  if (size === FeedWidgetSize.Tall) {
    return <BriefCard brief={brief} />;
  }

  return (
    <div className={classNames(surfaceClassName, 'flex-row')}>
      <div className="flex w-1/2 shrink-0 [&>*>*>*]:!rounded-none [&>*]:!rounded-none">
        <BriefCard brief={brief} />
      </div>
      {listLink(
        <>
          <Label
            trailing={
              <span className="font-bold text-text-primary group-hover:underline">
                Read the brief
              </span>
            }
          />
          <KeyPoints points={keyPoints} />
        </>,
        'p-4',
      )}
    </div>
  );
};
