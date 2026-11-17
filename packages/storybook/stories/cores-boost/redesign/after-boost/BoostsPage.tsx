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
import { BeforeIcon } from '@dailydotdev/shared/src/components/icons/Before';
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
import {
  formatDataTileValue,
  largeNumberFormat,
} from '@dailydotdev/shared/src/lib/numberFormat';
import type { Campaign } from '@dailydotdev/shared/src/graphql/campaigns';
import { CampaignState } from '@dailydotdev/shared/src/graphql/campaigns';
import { allCampaigns, unspentOf } from '../../flows/after-boost/fixtures';
import stripArt from '../../assets/boost-strip-patchy-v2.png';
import { SquadFrame } from './kit';
import { BoostAnalytics } from './BoostAnalytics';

// /boosts in the squads page frame, read like an analytics tool: metric tabs
// over a chart by day, then the boosts as a table with their numbers and
// actions (compact cards on phones), so there is no page per boost.

const remainingDaysOf = (campaign: Campaign): number | undefined =>
  campaign.state === CampaignState.Active
    ? getAbsoluteDifferenceInDays(new Date(campaign.endedAt), new Date())
    : undefined;

/** The card's title band, with the Patchy boost art on the far side */
export const TitleBand = ({ children }: { children: React.ReactNode }) => (
  <header className="relative flex min-h-16 items-center gap-2 overflow-hidden border-b border-border-subtlest-tertiary px-4 py-3 tablet:px-6">
    <img
      src={stripArt}
      alt=""
      className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-auto max-w-none -scale-x-100 [mask-image:linear-gradient(to_left,black_45%,transparent)] tablet:block"
    />
    <div className="relative flex min-w-0 flex-1 items-center gap-2">
      {children}
    </div>
  </header>
);

export enum BoostsTab {
  Live = 'Live',
  Ended = 'Ended',
}

interface BoostsPageProps {
  campaigns?: Campaign[];
  /** The tab it opens on, Live when anything is running */
  initialTab?: BoostsTab;
}

/** The boosts' chart, the Live/Ended tabs and the list, under any title */
export function BoostsSection(props: BoostsPageProps): ReactElement {
  const { campaigns = allCampaigns } = props;

  return (
    <>
      {!!campaigns.length && <BoostAnalytics campaigns={campaigns} />}
      <BoostsList {...props} />
    </>
  );
}

/** The Live/Ended tabs and the boosts as a table, or cards on phones */
export function BoostsList({
  campaigns = allCampaigns,
  initialTab,
}: BoostsPageProps): ReactElement {
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
        <>
          <ul className="grid grid-cols-1 gap-3 px-4 pb-4 pt-2 tablet:grid-cols-2 laptop:hidden">
            {active.list.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </ul>
          <div className="hidden pb-2 pt-2 laptop:block">
            <CampaignTable campaigns={active.list} />
          </div>
        </>
      ) : (
        emptyState
      )}
    </>
  );
}

export function BoostsPage(props: BoostsPageProps): ReactElement {
  return (
    <SquadFrame>
      <TitleBand>
        <h1 className="flex-1 font-bold typo-title2">Boost manager</h1>
        <DocsLinks />
      </TitleBand>
      <BoostsSection {...props} />
    </SquadFrame>
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

const CardStat = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}): ReactElement => (
  <span className="flex min-w-0 flex-col">
    <span className="text-text-tertiary typo-caption2">{label}</span>
    <strong className="flex items-center gap-1 tabular-nums typo-callout">
      {children}
    </strong>
  </span>
);

interface CampaignCardProps {
  campaign: Campaign;
  onStop?: () => void;
  onExtend?: () => void;
  onBoostAgain?: () => void;
}

/** One boost, compact: the post, its budget and progress, four numbers and the actions */
const CampaignCard = ({
  campaign,
  onStop,
  onExtend,
  onBoostAgain,
}: CampaignCardProps): ReactElement => {
  const { post, flags } = campaign;
  const isActive = campaign.state === CampaignState.Active;

  return (
    <li className="flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary p-3">
      <div className="flex items-center gap-3">
        <Image
          src={post.sharedPost?.image ?? post.image}
          alt=""
          className="h-10 w-14 shrink-0 rounded-10 object-cover"
        />
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <Link href={getPostPath(post)} passHref>
            <a className="truncate font-bold typo-callout hover:underline">
              {post.title ?? post.sharedPost?.title}
            </a>
          </Link>
          <span className="flex min-w-0 items-center gap-1 text-text-tertiary typo-caption1">
            <CoreIcon size={IconSize.Size16} />
            <span className="truncate tabular-nums">
              {formatDataTileValue(flags.budget ?? 0)} ·{' '}
              {shortDate(campaign.createdAt)} – {shortDate(campaign.endedAt)}
            </span>
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-2">
          <TimeLeft campaign={campaign} />
        </span>
      </div>
      <div className="grid grid-cols-4 gap-2 rounded-12 bg-surface-float px-3 py-2">
        <CardStat label="Spend">
          <CoreIcon size={IconSize.Size16} />
          {largeNumberFormat(flags.spend ?? 0)}
        </CardStat>
        <CardStat label="Impressions">
          {largeNumberFormat(flags.impressions ?? 0)}
        </CardStat>
        <CardStat label="Users">{largeNumberFormat(flags.users ?? 0)}</CardStat>
        <CardStat label="Clicks">
          {largeNumberFormat(flags.clicks ?? 0)}
        </CardStat>
      </div>
      {isActive ? (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant={ButtonVariant.Float}
            size={ButtonSize.Small}
            className="text-text-secondary hover:text-accent-ketchup-default"
            onClick={onStop}
          >
            Stop and refund <CoreIcon className="mx-1" size={IconSize.Size16} />
            {unspentOf(campaign).toLocaleString('en-US')}
          </Button>
          <Button
            variant={ButtonVariant.Float}
            size={ButtonSize.Small}
            onClick={onExtend}
          >
            Extend
          </Button>
        </div>
      ) : (
        <div className="flex justify-end">
          <Button
            variant={ButtonVariant.Float}
            size={ButtonSize.Small}
            icon={<BeforeIcon secondary />}
            onClick={onBoostAgain}
          >
            Boost again
          </Button>
        </div>
      )}
    </li>
  );
};

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

/** The boosts as a table from tablet up: one row each, numbers in columns */
const CampaignTable = ({
  campaigns,
  onStop,
  onExtend,
  onBoostAgain,
}: Omit<CampaignCardProps, 'campaign'> & {
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
              index === 0 && 'w-full pl-6',
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
            className="border-b border-border-subtlest-tertiary transition-colors hover:bg-surface-hover"
          >
            <td className="max-w-0 py-3 pl-6 pr-3">
              <span className="flex min-w-0 items-center gap-3">
                <Image
                  src={post.sharedPost?.image ?? post.image}
                  alt=""
                  className="h-8 w-12 shrink-0 rounded-8 object-cover"
                />
                <span className="flex min-w-0 flex-1 flex-col">
                  <Link href={getPostPath(post)} passHref>
                    <a className="truncate font-bold typo-footnote hover:underline">
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
            <td className="py-3 pl-3 pr-6">
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
                        onClick={onStop}
                      >
                        Stop
                      </Button>
                    </Tooltip>
                    <Button
                      variant={ButtonVariant.Float}
                      size={ButtonSize.XSmall}
                      onClick={onExtend}
                    >
                      Extend
                    </Button>
                  </>
                ) : (
                  <Button
                    variant={ButtonVariant.Float}
                    size={ButtonSize.XSmall}
                    onClick={onBoostAgain}
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
