import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../components/typography/Typography';
import {
  Button,
  ButtonColor,
  ButtonVariant,
} from '../../components/buttons/Button';
import { CoreIcon } from '../../components/icons';
import { IconSize } from '../../components/Icon';
import { DataTile } from './DataTile';
import { BeforeIcon } from '../../components/icons/Before';
import { ProgressBar } from '../../components/fields/ProgressBar';
import { getAbsoluteDifferenceInDays } from './utils';
import type { Campaign } from '../../graphql/campaigns';
import { CampaignType } from '../../graphql/campaigns';
import { DateFormat } from '../../components/utilities';
import { TimeFormatType } from '../../lib/dateFormat';
import { boostDashboardInfo } from './common';
import { Modal } from '../../components/modals/common/Modal';
import { formatDataTileValue } from '../../lib';
import { CampaignListViewPost } from './CampaignListViewPost';
import { CampaignListViewSquad } from './CampaignListViewSquad';

interface CampaignListViewProps {
  campaign: Campaign;
  isLoading: boolean;
  onBoostClick: () => void;
}

interface CampaignStatsGridProps {
  impressions: number;
  users: number;
  spend: number;
  className?: string;
}

export const CampaignStatsGrid = ({
  className,
  spend,
  users,
  impressions,
}: CampaignStatsGridProps) => (
  <div className={classNames('grid grid-cols-2 gap-4', className)}>
    <DataTile
      label="Spend"
      value={spend}
      info={boostDashboardInfo.spend}
      icon={<CoreIcon size={IconSize.XSmall} />}
    />
    <DataTile
      label="Impressions"
      value={impressions}
      info={boostDashboardInfo.impressions}
    />
    <DataTile label="Users" value={users} info={boostDashboardInfo.users} />
  </div>
);

const CampaignListViewPreview = ({ campaign }: { campaign: Campaign }) => {
  switch (campaign.type) {
    case CampaignType.Post:
      return <CampaignListViewPost post={campaign.post} />;
    case CampaignType.Source:
      return <CampaignListViewSquad squad={campaign.source} />;
    default:
      return null;
  }
};

export function CampaignListView({
  campaign,
  isLoading,
  onBoostClick,
}: CampaignListViewProps): ReactElement {
  const isActive = campaign.state === 'ACTIVE';
  const date = useMemo(() => {
    const startedAt = new Date(campaign.createdAt);
    const endedAt = new Date(campaign.endedAt);
    const totalDays = getAbsoluteDifferenceInDays(endedAt, startedAt);

    const getEndsIn = () => {
      if (isActive) {
        return getAbsoluteDifferenceInDays(endedAt, new Date());
      }

      return totalDays;
    };

    return {
      endsIn: getEndsIn(),
      startedIn: getAbsoluteDifferenceInDays(new Date(), startedAt),
      totalDays,
    };
  }, [campaign, isActive]);

  const percentage = useMemo(() => {
    if (campaign.state !== 'ACTIVE') {
      return 100;
    }

    return (date.startedIn / date.totalDays) * 100;
  }, [campaign.state, date]);

  return (
    <div className="flex flex-col gap-6">
      <CampaignListViewPreview campaign={campaign} />
      <div className="flex flex-col gap-1">
        <ProgressBar
          percentage={percentage}
          shouldShowBg
          className={{ wrapper: 'h-2 rounded-6' }}
        />
        <span className="flex flex-row justify-between">
          <Typography
            type={TypographyType.Subhead}
            color={TypographyColor.Secondary}
          >
            Started{' '}
            <DateFormat date={campaign.createdAt} type={TimeFormatType.Post} />
          </Typography>
          {isActive && (
            <Typography
              type={TypographyType.Subhead}
              color={TypographyColor.Secondary}
            >
              Ends in {date.endsIn} {date.endsIn === 1 ? 'day' : 'days'}
            </Typography>
          )}
        </span>
        <CampaignStatsGrid
          className="mt-3"
          spend={campaign.flags.spend}
          users={campaign.flags.users}
          impressions={campaign.flags.impressions}
        />
      </div>
      <div className="h-px w-full bg-border-subtlest-tertiary" />
      <div className="flex flex-col gap-2">
        <Modal.Subtitle>Summary</Modal.Subtitle>
        <Typography
          type={TypographyType.Callout}
          className="flex flex-row items-center"
        >
          <CoreIcon className="mr-1" size={IconSize.Size16} />{' '}
          {formatDataTileValue(campaign.flags.budget)} | {date.totalDays}{' '}
          {date.totalDays === 1 ? 'day' : 'days'}
        </Typography>
      </div>
      <Button
        variant={ButtonVariant.Float}
        className={classNames('w-full', {
          'bg-action-downvote-float hover:bg-action-downvote-hover': isActive,
        })}
        pressed={isActive}
        color={isActive && ButtonColor.Ketchup}
        icon={!isActive && <BeforeIcon secondary />}
        onClick={onBoostClick}
        disabled={isLoading}
        loading={isLoading}
      >
        {isActive ? 'Stop campaign' : 'Boost again'}
      </Button>
    </div>
  );
}
