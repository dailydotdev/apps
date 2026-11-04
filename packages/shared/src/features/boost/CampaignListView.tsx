import type { ReactElement, ReactNode } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../components/typography/Typography';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../components/buttons/Button';
import {
  AddUserIcon,
  CoreIcon,
  EyeIcon,
  OpenLinkIcon,
  UserIcon,
} from '../../components/icons';
import { IconSize } from '../../components/Icon';
import { DataTile } from '../../components/DataTile';
import { ProgressBar } from '../../components/fields/ProgressBar';
import { getAbsoluteDifferenceInDays } from './utils';
import type { Campaign } from '../../graphql/campaigns';
import { CampaignType } from '../../graphql/campaigns';
import { boostDashboardInfo } from './common';
import { formatDataTileValue, largeNumberFormat } from '../../lib';
import { isNullOrUndefined } from '../../lib/func';
import { BoostTarget } from './BoostTarget';
import { BoostStatus } from './CampaignListItem';
import { getPostPath } from '../../lib/links';

interface CampaignListViewProps {
  campaign: Campaign;
  isLoading: boolean;
  onBoostClick: () => void;
}

interface CampaignStatsGridProps {
  impressions: number;
  users: number;
  spend: number;
  members?: number;
  /** Shown under the spend, e.g. "of 35K budget". */
  spendCaption?: ReactNode;
  className?: string;
}

const iconClassName = 'text-text-tertiary';

const Caption = ({ children }: { children: ReactNode }): ReactElement => (
  <Typography type={TypographyType.Footnote} color={TypographyColor.Tertiary}>
    {children}
  </Typography>
);

export const CampaignStatsGrid = ({
  className,
  spend,
  users,
  members,
  impressions,
  spendCaption,
}: CampaignStatsGridProps): ReactElement => {
  const hasMembers = !isNullOrUndefined(members);

  const spendTile = (
    <DataTile
      label="Spent"
      value={spend}
      info={boostDashboardInfo.spend}
      icon={<CoreIcon size={IconSize.Size16} />}
      subtitle={spendCaption && <Caption>{spendCaption}</Caption>}
    />
  );
  const restTiles = (
    <>
      <DataTile
        label="Impressions"
        value={impressions}
        info={boostDashboardInfo.impressions}
        icon={<EyeIcon size={IconSize.Size16} className={iconClassName} />}
      />
      <DataTile
        label="Developers reached"
        value={users}
        info={boostDashboardInfo.users}
        icon={<UserIcon size={IconSize.Size16} className={iconClassName} />}
      />
      {hasMembers && (
        <DataTile
          label="New members"
          value={members}
          info={boostDashboardInfo.members}
          icon={
            <AddUserIcon size={IconSize.Size16} className={iconClassName} />
          }
        />
      )}
    </>
  );

  if (!spendCaption) {
    return (
      <div className={classNames('grid grid-cols-2 gap-3', className)}>
        {spendTile}
        {restTiles}
      </div>
    );
  }

  return (
    <div className={classNames('flex flex-col gap-3', className)}>
      {spendTile}
      <div className="grid grid-cols-2 gap-3">{restTiles}</div>
    </div>
  );
};

const shortDate = (date: Date): string =>
  date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const pluralDays = (days: number): string =>
  `${days} ${days === 1 ? 'day' : 'days'}`;

export const getCampaignTimeline = (campaign: Campaign) => {
  const isActive = campaign.state === 'ACTIVE';
  const startedAt = new Date(campaign.createdAt);
  const endedAt = new Date(campaign.endedAt);
  const totalDays = Math.max(
    1,
    getAbsoluteDifferenceInDays(endedAt, startedAt),
  );
  const elapsedDays = Math.min(
    totalDays,
    getAbsoluteDifferenceInDays(new Date(), startedAt),
  );
  const daysLeft = isActive
    ? getAbsoluteDifferenceInDays(endedAt, new Date())
    : 0;

  return { isActive, startedAt, endedAt, totalDays, elapsedDays, daysLeft };
};

const getProgressCopy = ({
  isActive,
  daysLeft,
  endedAt,
  state,
}: ReturnType<typeof getCampaignTimeline> & {
  state: Campaign['state'];
}): string => {
  if (!isActive) {
    return `${state === 'CANCELLED' ? 'Stopped' : 'Ended'} ${shortDate(
      endedAt,
    )}`;
  }

  if (daysLeft === 0) {
    return 'Ends today';
  }

  return daysLeft === 1 ? 'Ends tomorrow' : `${pluralDays(daysLeft)} left`;
};

const getTargetLink = (campaign: Campaign): string | undefined => {
  if (campaign.type === CampaignType.Post && campaign.post) {
    return getPostPath(campaign.post);
  }

  return campaign.source?.permalink;
};

/** The details of one boost: what, how far along, results, and its action. */
export function CampaignListView({
  campaign,
  isLoading,
  onBoostClick,
}: CampaignListViewProps): ReactElement {
  const timeline = useMemo(() => getCampaignTimeline(campaign), [campaign]);
  const { isActive, startedAt, endedAt, totalDays, elapsedDays } = timeline;
  const percentage = isActive ? (elapsedDays / totalDays) * 100 : 100;
  const budget = campaign.flags?.budget || 0;
  const link = getTargetLink(campaign);

  return (
    <div className="flex flex-col gap-6">
      <BoostTarget
        post={campaign.type === CampaignType.Post ? campaign.post : undefined}
        squad={
          campaign.type === CampaignType.Squad ? campaign.source : undefined
        }
        className="rounded-16 border border-border-subtlest-tertiary p-3"
        action={
          link && (
            <Button
              tag="a"
              href={link}
              icon={<OpenLinkIcon />}
              size={ButtonSize.Small}
              variant={ButtonVariant.Tertiary}
              aria-label="Open"
            />
          )
        }
      />
      <div className="flex flex-col gap-2">
        <span className="flex items-center justify-between gap-2">
          <BoostStatus status={campaign.state} />
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Footnote}
            color={TypographyColor.Secondary}
          >
            {getProgressCopy({ ...timeline, state: campaign.state })}
          </Typography>
        </span>
        <ProgressBar
          percentage={percentage}
          shouldShowBg
          className={{ wrapper: 'h-2 rounded-6' }}
        />
        <span className="flex justify-between">
          <Caption>Started {shortDate(startedAt)}</Caption>
          <Caption>
            {isActive ? `Ends ${shortDate(endedAt)}` : pluralDays(totalDays)}
          </Caption>
        </span>
      </div>
      <CampaignStatsGrid
        spend={campaign.flags?.spend || 0}
        spendCaption={
          <>
            of a {formatDataTileValue(budget)} budget,{' '}
            {largeNumberFormat(Math.round(budget / totalDays))} a day for{' '}
            {pluralDays(totalDays)}
          </>
        }
        users={campaign.flags?.users || 0}
        impressions={campaign.flags?.impressions || 0}
        members={
          campaign.type === CampaignType.Squad
            ? campaign.flags?.newMembers || 0
            : undefined
        }
      />
      {isActive ? (
        <Button
          type="button"
          variant={ButtonVariant.Float}
          className="w-full"
          onClick={onBoostClick}
          disabled={isLoading}
          loading={isLoading}
        >
          Stop boost
        </Button>
      ) : (
        <Button
          type="button"
          variant={ButtonVariant.Primary}
          className="w-full"
          onClick={onBoostClick}
          disabled={isLoading}
          loading={isLoading}
        >
          Boost again
        </Button>
      )}
    </div>
  );
}
