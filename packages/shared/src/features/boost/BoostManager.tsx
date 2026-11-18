import type { ReactElement, ReactNode } from 'react';
import React, { useMemo, useState } from 'react';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../components/buttons/Button';
import {
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

const ctrOf = ({ impressions = 0, clicks = 0 }): string =>
  impressions ? `${((clicks / impressions) * 100).toFixed(2)}%` : '0.00%';

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
  <div className="flex min-w-36 flex-1 shrink-0 flex-col gap-1 bg-background-default px-4 py-3 tablet:min-w-0 tablet:px-6">
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
      label: 'Clicks on post',
      info: boostDashboardInfo.clicks,
      value: largeNumberFormat(stats.clicks ?? 0),
    },
    {
      label: 'CTR',
      info: boostDashboardInfo.ctr,
      value: ctrOf(stats),
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
  ];

  return (
    <div className="flex flex-col gap-4">
      <StartupsAdsDashboardPromo spend={stats.spend ?? 0} />
      <div className={cardClassName}>
        <div className="no-scrollbar flex gap-px overflow-x-auto bg-border-subtlest-tertiary tablet:grid tablet:auto-cols-fr tablet:grid-flow-col">
          {metrics.map((metric) => (
            <MetricCell key={metric.label} {...metric} isLoading={isPending} />
          ))}
        </div>
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

const columns = ['Boost', 'Spend', 'Impressions', 'Clicks', 'CTR', 'Time', ''];

const BoostsTable = ({
  campaigns,
  onStop,
  onBoostAgain,
}: {
  campaigns: Campaign[];
  onStop: (campaign: Campaign) => void;
  onBoostAgain: (campaign: Campaign) => void;
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
              index > 0 && index < 5 && 'text-right',
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
            className="group border-b border-border-subtlest-tertiary transition-colors last:border-b-0 hover:bg-surface-hover"
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
              {largeNumberFormat(flags.clicks ?? 0)}
            </td>
            <td className={cellClassName}>{ctrOf(flags)}</td>
            <td className="px-3 py-3">
              <TimeLeft campaign={campaign} />
            </td>
            <td className="py-3 pl-3 pr-4 tablet:pr-6">
              <span className="flex justify-end gap-1">
                {campaign.state === CampaignState.Active ? (
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
  const tab = pickedTab ?? (live.length ? BoostsTab.Live : BoostsTab.Ended);
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
      className="pb-10"
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
            const label = isComplete ? `${name} (${list.length})` : name;

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
