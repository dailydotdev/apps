import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
import { SquadWidget } from '@dailydotdev/shared/src/features/squads/components/widgets/SquadWidget';
import {
  SquadDirectoryNavbar,
  SquadDirectoryNavbarItem,
} from '@dailydotdev/shared/src/components/squads/layout/SquadDirectoryNavbar';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  ArrowIcon,
  CoreIcon,
  OpenLinkIcon,
} from '@dailydotdev/shared/src/components/icons';
import { BeforeIcon } from '@dailydotdev/shared/src/components/icons/Before';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { Image } from '@dailydotdev/shared/src/components/image/Image';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import { ProgressBar } from '@dailydotdev/shared/src/components/fields/ProgressBar';
import { DateFormat } from '@dailydotdev/shared/src/components/utilities/DateFormat';
import { TimeFormatType } from '@dailydotdev/shared/src/lib/dateFormat';
import {
  CharmEmptyState,
  CharmEmptyStatePlacement,
} from '@dailydotdev/shared/src/components/charm/CharmEmptyState';
import { cloudinaryCharmNoPosts } from '@dailydotdev/shared/src/lib/image';
import { boostDocsLink } from '@dailydotdev/shared/src/lib/constants';
import { getPostPath } from '@dailydotdev/shared/src/lib/links';
import { BoostStatus } from '@dailydotdev/shared/src/features/boost/CampaignListItem';
import { getAbsoluteDifferenceInDays } from '@dailydotdev/shared/src/features/boost/utils';
import {
  formatDataTileValue,
  largeNumberFormat,
} from '@dailydotdev/shared/src/lib/numberFormat';
import type { Campaign } from '@dailydotdev/shared/src/graphql/campaigns';
import { CampaignState } from '@dailydotdev/shared/src/graphql/campaigns';
import {
  allCampaigns,
  campaignTotals,
  unspentOf,
} from '../../flows/after-boost/fixtures';
import stripArt from '../../assets/boost-strip-patchy-v2.png';
import { HelpWidget, SquadFrame, StatsGrid } from './kit';

// /boosts and /boosts/[id] in the squads page frame: the list and the
// campaign are the bordered card, the totals and help are widgets beside it.

const remainingDaysOf = (campaign: Campaign): number | undefined =>
  campaign.state === CampaignState.Active
    ? getAbsoluteDifferenceInDays(new Date(campaign.endedAt), new Date())
    : undefined;

/** A row in the hero cover "Reading list" widget's shape */
const CampaignRow = ({
  campaign,
  onClick,
}: {
  campaign: Campaign;
  onClick?: () => void;
}): ReactElement => {
  const { post, flags } = campaign;

  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="flex min-h-18 w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-hover tablet:px-6"
      >
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="line-clamp-2 break-words font-bold text-text-primary typo-subhead">
            {post.title}
          </span>
          <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-text-tertiary typo-caption1">
            <BoostStatus
              status={campaign.state}
              remainingDays={remainingDaysOf(campaign)}
            />
            <span className="flex items-center gap-1 tabular-nums">
              <CoreIcon size={IconSize.Size16} />
              {formatDataTileValue(flags.spend ?? 0)} spent
            </span>
            <span className="tabular-nums">
              {largeNumberFormat(flags.impressions ?? 0)} impressions
            </span>
          </span>
        </span>
        <Image
          src={post.image}
          alt=""
          className="size-12 shrink-0 rounded-10 object-cover"
        />
        <ArrowIcon
          size={IconSize.Small}
          className="shrink-0 rotate-90 text-text-tertiary"
        />
      </button>
    </li>
  );
};

/** The card's title band, with the Patchy boost art on the far side */
const TitleBand = ({ children }: { children: React.ReactNode }) => (
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

const ResultsWidget = () => (
  <SquadWidget title="All-time results">
    <StatsGrid totals={campaignTotals} className="mt-3" />
  </SquadWidget>
);

enum BoostsTab {
  Live = 'Live',
  Ended = 'Ended',
}

interface BoostsPageProps {
  campaigns?: Campaign[];
  onOpenCampaign?: (campaign: Campaign) => void;
}

export function BoostsPage({
  campaigns = allCampaigns,
  onOpenCampaign,
}: BoostsPageProps): ReactElement {
  const live = campaigns.filter(({ state }) => state === CampaignState.Active);
  const ended = campaigns.filter(({ state }) => state !== CampaignState.Active);
  const [tab, setTab] = useState(
    live.length ? BoostsTab.Live : BoostsTab.Ended,
  );
  const tabs = [
    { name: BoostsTab.Live, list: live },
    { name: BoostsTab.Ended, list: ended },
  ];
  const active = tabs.find(({ name }) => name === tab);

  return (
    <SquadFrame
      aside={
        <>
          <div className="hidden laptop:contents">
            <ResultsWidget />
          </div>
          <HelpWidget />
        </>
      }
    >
      <TitleBand>
        <h1 className="font-bold typo-title2">Boosts</h1>
      </TitleBand>
      <div className="px-4 pt-4 tablet:px-6 laptop:hidden">
        <StatsGrid totals={campaignTotals} className="tablet:grid-cols-4" />
      </div>
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
        <ul className="flex flex-col py-2">
          {active.list.map((campaign) => (
            <CampaignRow
              key={campaign.id}
              campaign={campaign}
              onClick={() => onOpenCampaign?.(campaign)}
            />
          ))}
        </ul>
      ) : (
        <CharmEmptyState
          image={cloudinaryCharmNoPosts}
          imageAlt="No boosts yet"
          title="No running ads yet"
          description="Learn how boosting works and launch your first campaign to get discovered by more developers."
          action={{ label: 'Learn more about boosting', href: boostDocsLink }}
          placement={CharmEmptyStatePlacement.Page}
          className="pb-10"
        />
      )}
    </SquadFrame>
  );
}

interface CampaignPageProps {
  campaign: Campaign;
  onBack?: () => void;
  onStop?: () => void;
  onExtend?: () => void;
  onBoostAgain?: () => void;
}

export function CampaignPage({
  campaign,
  onBack,
  onStop,
  onExtend,
  onBoostAgain,
}: CampaignPageProps): ReactElement {
  const { post, flags } = campaign;
  const isActive = campaign.state === CampaignState.Active;
  const date = useMemo(() => {
    const startedAt = new Date(campaign.createdAt);
    const endedAt = new Date(campaign.endedAt);
    const totalDays = getAbsoluteDifferenceInDays(endedAt, startedAt);

    return {
      endsIn: isActive
        ? getAbsoluteDifferenceInDays(endedAt, new Date())
        : totalDays,
      startedIn: getAbsoluteDifferenceInDays(new Date(), startedAt),
      totalDays,
    };
  }, [campaign, isActive]);
  const percentage = isActive ? (date.startedIn / date.totalDays) * 100 : 100;
  const endsIn = (() => {
    if (date.endsIn === 0) {
      return 'Ends in less than a day';
    }

    if (date.endsIn === 1) {
      return 'Ends tomorrow';
    }

    return `Ends in ${date.endsIn} days`;
  })();

  return (
    <SquadFrame aside={<HelpWidget />}>
      <TitleBand>
        <Button
          onClick={onBack}
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          icon={<ArrowIcon className="-rotate-90" />}
          aria-label="Back to Boosts"
        />
        <h1 className="font-bold typo-title2">Boost</h1>
        <BoostStatus
          status={campaign.state}
          remainingDays={remainingDaysOf(campaign)}
        />
      </TitleBand>
      <div className="flex flex-col gap-5 p-4 tablet:p-6">
        <div className="flex items-center gap-4">
          <Image
            src={post.sharedPost?.image ?? post.image}
            alt=""
            className="h-16 w-24 shrink-0 rounded-12 object-cover"
          />
          <span className="line-clamp-3 min-w-0 flex-1 break-words font-bold typo-body">
            {post.title ?? post.sharedPost?.title}
          </span>
          <Link href={getPostPath(post)} passHref>
            <Button
              tag="a"
              icon={<OpenLinkIcon />}
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.Small}
              aria-label="Open post"
            />
          </Link>
        </div>
        <section className="flex flex-col gap-3 rounded-16 bg-surface-float p-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-text-tertiary typo-caption1">Summary</span>
            <span className="flex items-center gap-1 font-bold tabular-nums typo-title3">
              <CoreIcon size={IconSize.Small} />
              {formatDataTileValue(flags.budget ?? 0)}
              <span className="font-normal text-text-tertiary typo-callout">
                · {date.totalDays} {date.totalDays === 1 ? 'day' : 'days'}
              </span>
            </span>
          </div>
          <ProgressBar
            percentage={percentage}
            shouldShowBg
            className={{ wrapper: 'h-2 rounded-6' }}
          />
          <span className="flex justify-between text-text-tertiary typo-footnote">
            <span>
              Started{' '}
              <DateFormat
                date={campaign.createdAt}
                type={TimeFormatType.Post}
              />
            </span>
            {isActive && <span>{endsIn}</span>}
          </span>
        </section>
        <StatsGrid
          totals={{
            spend: flags.spend ?? 0,
            impressions: flags.impressions ?? 0,
            users: flags.users ?? 0,
            clicks: flags.clicks ?? 0,
          }}
          className="tablet:grid-cols-4"
        />
        {isActive ? (
          <div className="flex flex-col gap-3 tablet:flex-row">
            <Button
              variant={ButtonVariant.Primary}
              className="w-full tablet:flex-1"
              onClick={onExtend}
            >
              Extend
            </Button>
            <Button
              variant={ButtonVariant.Float}
              className="w-full bg-action-downvote-float hover:bg-action-downvote-hover tablet:flex-1"
              pressed
              color={ButtonColor.Ketchup}
              onClick={onStop}
            >
              Stop and refund{' '}
              <CoreIcon className="mx-1" size={IconSize.Small} />
              {unspentOf(campaign).toLocaleString('en-US')}
            </Button>
          </div>
        ) : (
          <Button
            variant={ButtonVariant.Primary}
            className="w-full"
            icon={<BeforeIcon secondary />}
            onClick={onBoostAgain}
          >
            Boost again
          </Button>
        )}
      </div>
    </SquadFrame>
  );
}
