import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../components/buttons/Button';
import {
  ArrowIcon,
  CoreIcon,
  DocsIcon,
  FeedbackIcon,
  InfoIcon,
  PauseIcon,
} from '../../components/icons';
import { IconSize } from '../../components/Icon';
import { Image } from '../../components/image/Image';
import Link from '../../components/utilities/Link';
import ProgressCircle from '../../components/ProgressCircle';
import { Tooltip } from '../../components/tooltip/Tooltip';
import { ElementPlaceholder } from '../../components/ElementPlaceholder';
import InfiniteScrolling from '../../components/containers/InfiniteScrolling';
import {
  CharmEmptyState,
  CharmEmptyStatePlacement,
} from '../../components/charm/CharmEmptyState';
import {
  SquadDirectoryNavbar,
  SquadDirectoryNavbarItem,
} from '../../components/squads/layout/SquadDirectoryNavbar';
import { LeaderboardHeading } from '../leaderboard/LeaderboardRows';
import { StartupsAdsDashboardPromo } from '../squads/components/promos/StartupsPromo';
import { cloudinaryCharmNoPosts } from '../../lib/image';
import { boostDocsLink, creatorsTermsOfService } from '../../lib/constants';
import { getPostPath } from '../../lib/links';
import { largeNumberFormat } from '../../lib/numberFormat';
import { Origin } from '../../lib/log';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import type { Campaign } from '../../graphql/campaigns';
import {
  CampaignState,
  CampaignType,
  getUserCampaignStats,
} from '../../graphql/campaigns';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../../components/modals/common/types';
import { defaultStats, useCampaigns } from './useCampaigns';
import { useStopBoost } from './useStopBoost';
import { getAbsoluteDifferenceInDays } from './utils';
import { boostDashboardInfo, lastBoostOf } from './common';

const cardClassName =
  'flex flex-col overflow-hidden rounded-16 border border-border-subtlest-tertiary';

// Wide tables keep the name column in place while the figures scroll beside
// it on narrow screens. The gradients lay the translucent surfaces over the
// page color, so the figures scrolling under the column don't show through.
const tableScrollClassName =
  'no-scrollbar overflow-x-auto overscroll-x-contain';
const stickyColumnClassName = 'sticky left-0 z-1 min-w-[min(14rem,50vw)]';
const stickyHeadClassName = classNames(
  stickyColumnClassName,
  'bg-background-default bg-[linear-gradient(var(--theme-surface-float),var(--theme-surface-float))]',
);
const stickyCellClassName = classNames(
  stickyColumnClassName,
  'bg-background-default group-hover:bg-[linear-gradient(var(--theme-surface-hover),var(--theme-surface-hover))]',
);
const cellClassName = 'px-3 py-3 text-right tabular-nums typo-footnote';

/** Boosting's docs and terms, for the page header */
export const BoostManagerLinks = (): ReactElement => (
  <>
    <Button
      tag="a"
      href={boostDocsLink}
      target="_blank"
      rel="noreferrer"
      variant={ButtonVariant.Tertiary}
      size={ButtonSize.Small}
      icon={<FeedbackIcon />}
    >
      Docs
    </Button>
    <Button
      tag="a"
      href={creatorsTermsOfService}
      target="_blank"
      rel="noreferrer"
      variant={ButtonVariant.Tertiary}
      size={ButtonSize.Small}
      icon={<DocsIcon />}
    >
      Terms
    </Button>
  </>
);

const MetricCell = ({
  label,
  info,
  value,
  icon,
  isLoading,
}: {
  label: string;
  info: string;
  value: string | null;
  icon?: ReactNode;
  isLoading: boolean;
}): ReactElement => (
  <div className="flex min-w-36 flex-1 shrink-0 snap-start flex-col gap-1 bg-background-default px-4 py-3 tablet:min-w-0 tablet:px-6">
    <span className="flex items-center gap-1 text-text-tertiary typo-footnote">
      <span className="truncate">{label}</span>
      <Tooltip content={info} enableMobileClick>
        <span className="text-text-disabled">
          <InfoIcon size={IconSize.Size16} />
        </span>
      </Tooltip>
    </span>
    {isLoading ? (
      <ElementPlaceholder className="my-1 h-5 w-16 rounded-6" />
    ) : (
      <span className="flex items-center gap-1 font-bold tabular-nums typo-title3">
        {icon}
        {value}
      </span>
    )}
  </div>
);

type ScrollSide = 'before' | 'after';

const MetricsArrow = ({
  side,
  onClick,
}: {
  side: ScrollSide;
  onClick: () => void;
}): ReactElement => {
  const isAfter = side === 'after';

  return (
    <div
      className={classNames(
        'pointer-events-none absolute inset-y-0 z-1 flex w-16 items-center from-background-default via-background-default to-transparent',
        isAfter
          ? 'right-0 justify-end bg-gradient-to-l pr-2'
          : 'left-0 justify-start bg-gradient-to-r pl-2',
      )}
    >
      <Button
        type="button"
        tabIndex={-1}
        aria-hidden
        className="pointer-events-auto"
        variant={ButtonVariant.Float}
        size={ButtonSize.XSmall}
        icon={<ArrowIcon className={isAfter ? 'rotate-90' : '-rotate-90'} />}
        onClick={onClick}
      />
    </div>
  );
};

/** The totals scroll sideways on phones: an arrow shows on the side with more */
const MetricsRow = ({ children }: { children: ReactNode }): ReactElement => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [more, setMore] = useState({ before: false, after: false });

  useEffect(() => {
    const row = rowRef.current;
    if (!row) {
      return undefined;
    }

    const update = () =>
      setMore({
        before: row.scrollLeft > 1,
        after: row.scrollLeft + row.clientWidth < row.scrollWidth - 1,
      });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(row);
    row.addEventListener('scroll', update, { passive: true });

    return () => {
      observer.disconnect();
      row.removeEventListener('scroll', update);
    };
  }, []);

  const scroll = (direction: 1 | -1) =>
    rowRef.current?.scrollBy({
      left: direction * rowRef.current.clientWidth * 0.8,
      behavior: 'smooth',
    });

  return (
    <div className="relative">
      <div
        ref={rowRef}
        className="no-scrollbar flex snap-x snap-mandatory gap-px overflow-x-auto overscroll-x-contain bg-border-subtlest-tertiary tablet:grid tablet:auto-cols-fr tablet:grid-flow-col"
      >
        {children}
      </div>
      {more.before && <MetricsArrow side="before" onClick={() => scroll(-1)} />}
      {more.after && <MetricsArrow side="after" onClick={() => scroll(1)} />}
    </div>
  );
};

/** All boosts' totals, all time: the API has no daily breakdown to chart */
const BoostMetrics = (): ReactElement => {
  const { user } = useAuthContext();
  const { data: stats = defaultStats, isPending } = useQuery({
    queryKey: generateQueryKey(RequestKey.Campaigns, user, 'stats'),
    queryFn: getUserCampaignStats,
    staleTime: StaleTime.Default,
    enabled: !!user,
  });
  const metrics = [
    {
      label: 'Impressions',
      info: boostDashboardInfo.impressions,
      value: largeNumberFormat(stats.impressions ?? 0),
    },
    {
      label: 'Users',
      info: boostDashboardInfo.users,
      value: largeNumberFormat(stats.users ?? 0),
    },
    {
      label: 'Spend',
      info: boostDashboardInfo.spend,
      value: largeNumberFormat(stats.spend ?? 0),
      icon: <CoreIcon size={IconSize.Small} />,
    },
    {
      label: 'New members',
      info: boostDashboardInfo.members,
      value: largeNumberFormat(stats.newMembers ?? 0),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <StartupsAdsDashboardPromo spend={stats.spend ?? 0} />
      <div className={cardClassName}>
        <MetricsRow>
          {metrics.map((metric) => (
            <MetricCell key={metric.label} {...metric} isLoading={isPending} />
          ))}
        </MetricsRow>
      </div>
    </div>
  );
};

enum BoostsTab {
  Live = 'Live',
  Ended = 'Ended',
}

const shortDate = (date: Date | string): string =>
  new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

const daysLeftOf = ({ endedAt }: Campaign): string => {
  const days = getAbsoluteDifferenceInDays(new Date(endedAt), new Date());

  if (days === 0) {
    return 'Ends today';
  }

  return days === 1 ? '1 day left' : `${days} days left`;
};

/** Full at the start, emptying as the days run out. Capped under 100, where
 * ProgressCircle swaps the ring for a check mark */
const timeLeftOf = ({ createdAt, endedAt }: Campaign): number => {
  const start = new Date(createdAt).getTime();
  const end = new Date(endedAt).getTime();

  return Math.max(0, Math.min(99, ((end - Date.now()) / (end - start)) * 100));
};

const endedStatus: Partial<Record<CampaignState, string>> = {
  [CampaignState.Completed]: 'bg-action-share-active text-action-share-default',
  [CampaignState.Cancelled]: 'bg-surface-float text-text-secondary',
};

const TimeLeft = ({ campaign }: { campaign: Campaign }): ReactElement =>
  campaign.state === CampaignState.Active ? (
    <span className="flex items-center gap-2">
      <ProgressCircle progress={timeLeftOf(campaign)} size={20} stroke={3} />
      <span className="whitespace-nowrap text-text-tertiary typo-footnote">
        {daysLeftOf(campaign)}
      </span>
    </span>
  ) : (
    <span
      className={classNames(
        'whitespace-nowrap rounded-6 px-1 typo-footnote',
        endedStatus[campaign.state],
      )}
    >
      {campaign.state === CampaignState.Completed ? 'Completed' : 'Stopped'}
    </span>
  );

const BoostName = ({ campaign }: { campaign: Campaign }): ReactElement => {
  const { post, source } = campaign;
  const isPost = campaign.type === CampaignType.Post;
  const image = isPost
    ? (post?.sharedPost?.image ?? post?.image)
    : source?.image;
  const title = isPost
    ? (post?.title ?? post?.sharedPost?.title)
    : source?.name;
  const href = isPost && post ? getPostPath(post) : source?.permalink;

  return (
    <span className="flex min-w-0 items-center gap-3">
      <Image
        src={image}
        alt=""
        className={classNames(
          'hidden h-8 shrink-0 object-cover tablet:block',
          isPost ? 'w-12 rounded-8' : 'w-8 rounded-full',
        )}
      />
      <span className="flex min-w-0 flex-1 flex-col">
        {href ? (
          <Link href={href} passHref>
            <a className="line-clamp-2 font-bold typo-footnote hover:underline laptop:truncate">
              {title}
            </a>
          </Link>
        ) : (
          <span className="line-clamp-2 font-bold typo-footnote laptop:truncate">
            {title}
          </span>
        )}
        <span className="truncate text-text-tertiary typo-caption1">
          {shortDate(campaign.createdAt)} – {shortDate(campaign.endedAt)}
        </span>
      </span>
    </span>
  );
};

const columns = ['Boost', 'Spend', 'Impressions', 'New members', 'Time', ''];

const BoostsTable = ({
  campaigns,
  onStop,
  onBoostAgain,
  blinkingId,
}: {
  campaigns: Campaign[];
  onStop: (campaign: Campaign) => void;
  onBoostAgain: (campaign: Campaign) => void;
  blinkingId?: string;
}): ReactElement => (
  <table className="w-full table-auto border-collapse text-left">
    <thead>
      <tr className="border-y border-border-subtlest-tertiary bg-surface-float">
        {columns.map((column, index) => (
          <th
            key={column || 'actions'}
            scope="col"
            className={classNames(
              'whitespace-nowrap px-3 py-2 font-bold uppercase tracking-wider text-text-tertiary typo-caption2',
              index === 0 &&
                classNames(stickyHeadClassName, 'w-full pl-4 tablet:pl-6'),
              index > 0 && index < 4 && 'text-right',
            )}
          >
            {column}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {campaigns.map((campaign) => {
        const { flags } = campaign;

        return (
          <tr
            key={campaign.id}
            data-campaign-id={campaign.id}
            className={classNames(
              'group border-b border-border-subtlest-tertiary transition-colors last:border-b-0 hover:bg-surface-hover',
              campaign.id === blinkingId && '[&>td]:animate-row-blink',
            )}
          >
            <td
              className={classNames(
                stickyCellClassName,
                'max-w-0 py-3 pl-4 pr-3 tablet:pl-6',
              )}
            >
              <BoostName campaign={campaign} />
            </td>
            <td className={cellClassName}>
              <span className="inline-flex items-center gap-1">
                <CoreIcon size={IconSize.Size16} />
                {largeNumberFormat(flags.spend ?? 0)}
              </span>
            </td>
            <td className={cellClassName}>
              {largeNumberFormat(flags.impressions ?? 0)}
            </td>
            <td className={cellClassName}>
              {/* Only a squad boost brings members */}
              {campaign.type === CampaignType.Squad
                ? largeNumberFormat(flags.newMembers ?? 0)
                : '–'}
            </td>
            <td className="px-3 py-3">
              <TimeLeft campaign={campaign} />
            </td>
            <td className="py-3 pl-3 pr-4 tablet:pr-6">
              <span className="flex justify-end gap-1">
                {campaign.state === CampaignState.Active ? (
                  !campaign.flags?.origin && (
                    <Tooltip content="Stops the boost now and refunds the Cores it has not spent">
                      <Button
                        variant={ButtonVariant.Float}
                        size={ButtonSize.XSmall}
                        icon={<PauseIcon />}
                        className="text-text-secondary hover:text-accent-ketchup-default"
                        onClick={() => onStop(campaign)}
                      >
                        Stop
                      </Button>
                    </Tooltip>
                  )
                ) : (
                  <Button
                    variant={ButtonVariant.Float}
                    size={ButtonSize.XSmall}
                    className="whitespace-nowrap"
                    onClick={() => onBoostAgain(campaign)}
                  >
                    Boost again
                  </Button>
                )}
              </span>
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>
);

/**
 * The boost a link points to (`?boost=<id>`), once per boost: scrolled into
 * view when it is off screen, then blinked. Returns the id while it blinks.
 */
const useBlinkLinkedRow = (campaignId?: string): string | undefined => {
  const [blinkingId, setBlinkingId] = useState<string>();
  const doneIdRef = useRef<string>();
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const frameRef = useRef<number>();

  // Re-renders don't cancel a pending blink, only leaving the page does
  useEffect(
    () => () => {
      clearTimeout(timeoutRef.current);
      cancelAnimationFrame(frameRef.current ?? 0);
    },
    [],
  );

  // Runs after every render until the row is on the page
  useEffect(() => {
    if (!campaignId || doneIdRef.current === campaignId) {
      return;
    }

    const row = document.querySelector(`[data-campaign-id="${campaignId}"]`);
    // Not laid out yet, like while dev styles load
    if (!row?.getClientRects().length) {
      return;
    }

    doneIdRef.current = campaignId;
    const blink = () => {
      cancelAnimationFrame(frameRef.current ?? 0);
      setBlinkingId(campaignId);
      timeoutRef.current = setTimeout(() => setBlinkingId(undefined), 1200);
    };
    const { top, bottom } = row.getBoundingClientRect();

    if (top >= 0 && bottom <= window.innerHeight) {
      blink();
      return;
    }

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    row.scrollIntoView({
      block: 'center',
      behavior: reduceMotion ? 'auto' : 'smooth',
    });

    // Blink once the page has moved and held still for a few frames (longer
    // if it never moves, as smooth scrolling can start late), or after 1.5s
    let lastY = window.scrollY;
    let stillFrames = 0;
    let hasMoved = false;
    const waitForStill = () => {
      const isStill = window.scrollY === lastY;
      hasMoved = hasMoved || !isStill;
      stillFrames = isStill ? stillFrames + 1 : 0;
      lastY = window.scrollY;
      if (stillFrames >= (hasMoved ? 6 : 20)) {
        clearTimeout(timeoutRef.current);
        blink();
        return;
      }
      frameRef.current = requestAnimationFrame(waitForStill);
    };
    frameRef.current = requestAnimationFrame(waitForStill);
    timeoutRef.current = setTimeout(blink, 1500);
  });

  return blinkingId;
};

const BoostsList = (): ReactElement => {
  const { openModal } = useLazyModal();
  const { onStopBoost } = useStopBoost();
  const { data, isLoading, infiniteScrollingProps } = useCampaigns();
  const campaigns = useMemo(
    () =>
      data?.pages.flatMap((page) => page.edges.map(({ node }) => node)) ?? [],
    [data],
  );
  const live = campaigns.filter(({ state }) => state === CampaignState.Active);
  const ended = campaigns.filter(({ state }) => state !== CampaignState.Active);
  const [pickedTab, setTab] = useState<BoostsTab>();
  const { query } = useRouter();
  const linkedId = typeof query.boost === 'string' ? query.boost : undefined;
  const linked = campaigns.find(({ id }) => id === linkedId);
  const linkedTab =
    linked &&
    (linked.state === CampaignState.Active ? BoostsTab.Live : BoostsTab.Ended);
  const tab =
    pickedTab ?? linkedTab ?? (live.length ? BoostsTab.Live : BoostsTab.Ended);
  const blinkingId = useBlinkLinkedRow(linked?.id);
  const tabs = [
    { name: BoostsTab.Live, list: live },
    { name: BoostsTab.Ended, list: ended },
  ];
  const active = tab === BoostsTab.Live ? live : ended;
  // Counts only add up once every page is in
  const isComplete = !infiniteScrollingProps.canFetchMore;

  const onBoostAgain = (campaign: Campaign) => {
    if (campaign.type === CampaignType.Post && campaign.post) {
      openModal({
        type: LazyModal.BoostPost,
        props: {
          post: campaign.post,
          origin: Origin.AdsDashboard,
          lastBoost: lastBoostOf(campaign),
        },
      });
      return;
    }

    if (campaign.type === CampaignType.Squad && campaign.source) {
      openModal({
        type: LazyModal.BoostSquad,
        props: { squad: campaign.source, origin: Origin.AdsDashboard },
      });
    }
  };

  const emptyState = (
    <CharmEmptyState
      image={cloudinaryCharmNoPosts}
      imageAlt="No boosts yet"
      title="No running ads yet"
      description="Learn how boosting works and launch your first campaign to get discovered by more developers."
      action={{ label: 'Learn more about boosting', href: boostDocsLink }}
      placement={CharmEmptyStatePlacement.Page}
    />
  );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 p-4 tablet:px-6">
        {[0, 1, 2].map((key) => (
          <ElementPlaceholder key={key} className="h-10 w-full rounded-8" />
        ))}
      </div>
    );
  }

  if (!campaigns.length) {
    return emptyState;
  }

  return (
    <>
      <div className="px-4 tablet:px-6">
        <SquadDirectoryNavbar
          aria-label="Live and ended boosts"
          className="!mx-0 !px-0"
        >
          {tabs.map(({ name, list }) => {
            const label =
              isComplete && name === BoostsTab.Live
                ? `${name} (${list.length})`
                : name;

            return (
              <SquadDirectoryNavbarItem
                key={name}
                buttonSize={ButtonSize.Small}
                isActive={tab === name}
                label={label}
                ariaLabel={label}
                onClick={() => setTab(name)}
              />
            );
          })}
        </SquadDirectoryNavbar>
      </div>
      <InfiniteScrolling {...infiniteScrollingProps}>
        {active.length ? (
          <div className={classNames(tableScrollClassName, 'pt-2')}>
            <BoostsTable
              campaigns={active}
              onStop={onStopBoost}
              onBoostAgain={onBoostAgain}
              blinkingId={blinkingId}
            />
          </div>
        ) : (
          emptyState
        )}
      </InfiniteScrolling>
    </>
  );
};

/** Analytics' Boost tab: every boost's numbers and actions on one page */
export function BoostManager(): ReactElement {
  return (
    <div className="flex flex-col gap-8 tablet:gap-10">
      <BoostMetrics />
      <section className="flex flex-col gap-4">
        <LeaderboardHeading title="Your boosts" />
        <div className={cardClassName}>
          <BoostsList />
        </div>
      </section>
    </div>
  );
}
