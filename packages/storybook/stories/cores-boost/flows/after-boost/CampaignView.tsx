import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  Button,
  ButtonColor,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { CoreIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { DataTile } from '@dailydotdev/shared/src/components/DataTile';
import { BeforeIcon } from '@dailydotdev/shared/src/components/icons/Before';
import { ProgressBar } from '@dailydotdev/shared/src/components/fields/ProgressBar';
import { getAbsoluteDifferenceInDays } from '@dailydotdev/shared/src/features/boost/utils';
import type { Campaign } from '@dailydotdev/shared/src/graphql/campaigns';
import { DateFormat } from '@dailydotdev/shared/src/components/utilities/DateFormat';
import { TimeFormatType } from '@dailydotdev/shared/src/lib/dateFormat';
import { boostDashboardInfo } from '@dailydotdev/shared/src/features/boost/common';
import { Modal } from '@dailydotdev/shared/src/components/modals/common/Modal';
import { formatDataTileValue } from '@dailydotdev/shared/src/lib/numberFormat';
import { CampaignListViewPost } from '@dailydotdev/shared/src/features/boost/CampaignListViewPost';
import { unspentOf } from './fixtures';

// `CampaignListView` and `CampaignStatsGrid` with the fixes: clicks on the
// post join the stats, an active boost can be extended, and stopping names
// the refund before the user commits.

export const clicksInfo = 'The total number of clicks on your boosted post';

interface StatsGridProps {
  spend: number;
  impressions: number;
  users: number;
  clicks: number;
  className?: string;
}

export const CampaignStatsGrid = ({
  className,
  spend,
  impressions,
  users,
  clicks,
}: StatsGridProps): ReactElement => (
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
    <DataTile label="Clicks on post" value={clicks} info={clicksInfo} />
  </div>
);

interface CampaignViewProps {
  campaign: Campaign;
  onStop?: () => void;
  onExtend?: () => void;
  onBoostAgain?: () => void;
}

export function CampaignView({
  campaign,
  onStop,
  onExtend,
  onBoostAgain,
}: CampaignViewProps): ReactElement {
  const isActive = campaign.state === 'ACTIVE';
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
    <div className="flex flex-col gap-6">
      <CampaignListViewPost post={campaign.post} />
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
              {endsIn}
            </Typography>
          )}
        </span>
        <CampaignStatsGrid
          className="mt-3"
          spend={campaign.flags?.spend || 0}
          impressions={campaign.flags?.impressions || 0}
          users={campaign.flags?.users || 0}
          clicks={campaign.flags?.clicks || 0}
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
          {formatDataTileValue(campaign.flags?.budget || 0)} | {date.totalDays}{' '}
          {date.totalDays === 1 ? 'day' : 'days'}
        </Typography>
      </div>
      {isActive ? (
        <div className="flex flex-col gap-3 tablet:flex-row">
          <Button
            variant={ButtonVariant.Primary}
            className="flex-1"
            onClick={onExtend}
          >
            Extend
          </Button>
          <Button
            variant={ButtonVariant.Float}
            className="flex-1 bg-action-downvote-float hover:bg-action-downvote-hover"
            pressed
            color={ButtonColor.Ketchup}
            onClick={onStop}
          >
            Stop and refund <CoreIcon className="mx-1" size={IconSize.Small} />
            {unspentOf(campaign).toLocaleString('en-US')}
          </Button>
        </div>
      ) : (
        <Button
          variant={ButtonVariant.Float}
          className="w-full"
          icon={<BeforeIcon secondary />}
          onClick={onBoostAgain}
        >
          Boost again
        </Button>
      )}
    </div>
  );
}
