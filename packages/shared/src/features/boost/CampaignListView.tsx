import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../components/typography/Typography';
import { Image } from '../../components/image/Image';
import {
  Button,
  ButtonColor,
  ButtonVariant,
} from '../../components/buttons/Button';
import { CoreIcon, OpenLinkIcon } from '../../components/icons';
import { IconSize } from '../../components/Icon';
import { DataTile } from '../../components/DataTile';
import { BeforeIcon } from '../../components/icons/Before';
import { ProgressBar } from '../../components/fields/ProgressBar';
import { getAbsoluteDifferenceInDays } from './utils';
import type { BoostedPostData } from '../../graphql/post/boost';
import { DateFormat } from '../../components/utilities';
import { TimeFormatType } from '../../lib/dateFormat';
import { boostDashboardInfo } from '../../components/modals/post/boost/common';
import { Modal } from '../../components/modals/common/Modal';
import { formatDataTileValue } from '../../lib';

interface CampaignListViewProps {
  data: BoostedPostData;
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

export function CampaignListView({
  data,
  isLoading,
  onBoostClick,
}: CampaignListViewProps): ReactElement {
  const { campaign, post } = data;
  const isActive = campaign.status === 'ACTIVE';
  const date = useMemo(() => {
    const startedAt = new Date(campaign.startedAt);
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
    if (campaign.status !== 'ACTIVE') {
      return 100;
    }

    return (date.startedIn / date.totalDays) * 100;
  }, [campaign.status, date]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-row items-center gap-4 rounded-16 border border-border-subtlest-tertiary p-2 pl-3">
        <span className="flex flex-1 flex-row">
          <Typography
            type={TypographyType.Callout}
            className="line-clamp-3 flex-1"
            style={{ lineBreak: 'anywhere' }}
          >
            {post.title}
          </Typography>
        </span>
        <Image src={post.image} className="h-12 w-18 rounded-12 object-cover" />
        <Button
          icon={<OpenLinkIcon />}
          variant={ButtonVariant.Tertiary}
          tag="a"
          href={post.commentsPermalink}
        />
      </div>
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
            <DateFormat date={campaign.startedAt} type={TimeFormatType.Post} />
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
          spend={campaign.spend}
          users={campaign.users}
          impressions={campaign.impressions}
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
          {formatDataTileValue(campaign.budget)} | {date.totalDays}{' '}
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
