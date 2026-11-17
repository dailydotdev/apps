import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  SquadDirectoryNavbar,
  SquadDirectoryNavbarItem,
} from '@dailydotdev/shared/src/components/squads/layout/SquadDirectoryNavbar';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  CoreIcon,
  DocsIcon,
  FeedbackIcon,
  PauseIcon,
} from '@dailydotdev/shared/src/components/icons';
import { Tooltip } from '@dailydotdev/shared/src/components/tooltip/Tooltip';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { Image } from '@dailydotdev/shared/src/components/image/Image';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import ProgressCircle from '@dailydotdev/shared/src/components/ProgressCircle';
import {
  CharmEmptyState,
  CharmEmptyStatePlacement,
} from '@dailydotdev/shared/src/components/charm/CharmEmptyState';
import { cloudinaryCharmNoPosts } from '@dailydotdev/shared/src/lib/image';
import {
  boostDocsLink,
  creatorsTermsOfService,
} from '@dailydotdev/shared/src/lib/constants';
import { getPostPath } from '@dailydotdev/shared/src/lib/links';
import { BoostStatus } from '@dailydotdev/shared/src/features/boost/CampaignListItem';
import { getAbsoluteDifferenceInDays } from '@dailydotdev/shared/src/features/boost/utils';
import { largeNumberFormat } from '@dailydotdev/shared/src/lib/numberFormat';
import type { Campaign } from '@dailydotdev/shared/src/graphql/campaigns';
import { CampaignState } from '@dailydotdev/shared/src/graphql/campaigns';
import { allCampaigns, unspentOf } from '../../flows/after-boost/fixtures';
import {
  stickyCellClassName,
  stickyHeadClassName,
  tableScrollClassName,
} from './BoostAnalytics';

// The Analytics page's Boost tab below its chart: the boosts as a table with
// their numbers and actions, so there is no page per boost. On phones the
// figures scroll beside the boost's name, as in the Ads Manager.

const remainingDaysOf = (campaign: Campaign): number | undefined =>
  campaign.state === CampaignState.Active
    ? getAbsoluteDifferenceInDays(new Date(campaign.endedAt), new Date())
    : undefined;

export enum BoostsTab {
  Live = 'Live',
  Ended = 'Ended',
}

interface CampaignActionsProps {
  onStop?: (campaign: Campaign) => void;
  onExtend?: (campaign: Campaign) => void;
  onBoostAgain?: (campaign: Campaign) => void;
}

interface BoostsListProps extends CampaignActionsProps {
  campaigns?: Campaign[];
  /** The tab it opens on, Live when anything is running */
  initialTab?: BoostsTab;
}

/** The Live/Ended tabs and the boosts as a table */
export function BoostsList({
  campaigns = allCampaigns,
  initialTab,
  ...actions
}: BoostsListProps): ReactElement {
  const live = campaigns.filter(({ state }) => state === CampaignState.Active);
  const ended = campaigns.filter(({ state }) => state !== CampaignState.Active);
  const [tab, setTab] = useState(
    initialTab ?? (live.length ? BoostsTab.Live : BoostsTab.Ended),
  );
  const tabs = [
    { name: BoostsTab.Live, list: live },
    { name: BoostsTab.Ended, list: ended },
  ];
  const active = tabs.find(({ name }) => name === tab);
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

  // Nothing boosted yet: no tabs to switch between
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
          {tabs.map(({ name, list }) => (
            <SquadDirectoryNavbarItem
              key={name}
              buttonSize={ButtonSize.Small}
              isActive={tab === name}
              label={`${name} (${list.length})`}
              ariaLabel={`${name} (${list.length})`}
              onClick={() => setTab(name)}
            />
          ))}
        </SquadDirectoryNavbar>
      </div>
      {active.list.length ? (
        <div className={classNames(tableScrollClassName, 'pt-2')}>
          <CampaignTable campaigns={active.list} {...actions} />
        </div>
      ) : (
        emptyState
      )}
    </>
  );
}

/** Boosting's docs and terms, as small links for a title band */
export const DocsLinks = (): ReactElement => (
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

const daysLeftOf = (campaign: Campaign): string => {
  const days = remainingDaysOf(campaign) ?? 0;

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

  return Math.min(99, ((end - Date.now()) / (end - start)) * 100);
};

/** The time ring and days left of a live boost, the status of an ended one */
const TimeLeft = ({ campaign }: { campaign: Campaign }): ReactElement =>
  campaign.state === CampaignState.Active ? (
    <span className="flex items-center gap-2">
      <ProgressCircle progress={timeLeftOf(campaign)} size={20} stroke={3} />
      <span className="whitespace-nowrap text-text-tertiary typo-footnote">
        {daysLeftOf(campaign)}
      </span>
    </span>
  ) : (
    <BoostStatus status={campaign.state} />
  );

const shortDate = (date: Date | string): string =>
  new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

const ctrOf = ({ flags }: Campaign): string =>
  flags.impressions
    ? `${(((flags.clicks ?? 0) / flags.impressions) * 100).toFixed(2)}%`
    : '0.00%';

const columns = ['Boost', 'Spend', 'Impressions', 'Clicks', 'CTR', 'Time', ''];

/** The boosts as a table: one row each, numbers in columns */
const CampaignTable = ({
  campaigns,
  onStop,
  onExtend,
  onBoostAgain,
}: CampaignActionsProps & {
  campaigns: Campaign[];
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
        const { post, flags } = campaign;
        const isActive = campaign.state === CampaignState.Active;

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
              <span className="flex min-w-0 items-center gap-3">
                <Image
                  src={post.sharedPost?.image ?? post.image}
                  alt=""
                  className="hidden h-8 w-12 shrink-0 rounded-8 object-cover tablet:block"
                />
                <span className="flex min-w-0 flex-1 flex-col">
                  <Link href={getPostPath(post)} passHref>
                    <a className="line-clamp-2 font-bold typo-footnote hover:underline laptop:truncate">
                      {post.title ?? post.sharedPost?.title}
                    </a>
                  </Link>
                  <span className="truncate text-text-tertiary typo-caption1">
                    {shortDate(campaign.createdAt)} –{' '}
                    {shortDate(campaign.endedAt)}
                  </span>
                </span>
              </span>
            </td>
            <td className="px-3 py-3 text-right tabular-nums typo-footnote">
              <span className="inline-flex items-center gap-1">
                <CoreIcon size={IconSize.Size16} />
                {largeNumberFormat(flags.spend ?? 0)}
              </span>
            </td>
            <td className="px-3 py-3 text-right tabular-nums typo-footnote">
              {largeNumberFormat(flags.impressions ?? 0)}
            </td>
            <td className="px-3 py-3 text-right tabular-nums typo-footnote">
              {largeNumberFormat(flags.clicks ?? 0)}
            </td>
            <td className="px-3 py-3 text-right tabular-nums typo-footnote">
              {ctrOf(campaign)}
            </td>
            <td className="px-3 py-3">
              <TimeLeft campaign={campaign} />
            </td>
            <td className="py-3 pl-3 pr-4 tablet:pr-6">
              <span className="flex justify-end gap-1">
                {isActive ? (
                  <>
                    <Tooltip
                      content={`Stops the boost now and refunds the ${unspentOf(
                        campaign,
                      ).toLocaleString('en-US')} Cores it has not spent`}
                    >
                      <Button
                        variant={ButtonVariant.Float}
                        size={ButtonSize.XSmall}
                        icon={<PauseIcon />}
                        className="text-text-secondary hover:text-accent-ketchup-default"
                        onClick={() => onStop?.(campaign)}
                      >
                        Stop
                      </Button>
                    </Tooltip>
                    <Button
                      variant={ButtonVariant.Float}
                      size={ButtonSize.XSmall}
                      onClick={() => onExtend?.(campaign)}
                    >
                      Extend
                    </Button>
                  </>
                ) : (
                  <Button
                    variant={ButtonVariant.Float}
                    size={ButtonSize.XSmall}
                    onClick={() => onBoostAgain?.(campaign)}
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
