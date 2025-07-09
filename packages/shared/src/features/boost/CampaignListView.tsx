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
import { CoreIcon, LinkIcon } from '../../components/icons';
import { IconSize } from '../../components/Icon';
import { DataTile } from './DataTile';
import { BeforeIcon } from '../../components/icons/Before';
import { ProgressBar } from '../../components/fields/ProgressBar';
import { getAbsoluteDifferenceInDays } from './utils';
import type { BoostedPostData } from '../../graphql/post/boost';
import { DateFormat } from '../../components/utilities';
import { TimeFormatType } from '../../lib/dateFormat';

interface CampaignListViewProps {
  data: BoostedPostData;
  isLoading: boolean;
  onBoostClick: () => void;
}

interface CampaignStatsGridProps {
  impressions: number;
  engagements: number;
  clicks: number;
  cores: number;
  className?: string;
}

export const CampaignStatsGrid = ({
  className,
  cores,
  clicks,
  engagements,
  impressions,
}: CampaignStatsGridProps) => (
  <div className={classNames('grid grid-cols-2 gap-4', className)}>
    <DataTile
      label="Spend"
      value={cores}
      icon={<CoreIcon size={IconSize.XSmall} />}
    />
    <DataTile label="Impressions" value={impressions} />
    <DataTile label="Clicks" value={clicks} />
    <DataTile label="Engagements" value={engagements} />
  </div>
);

export function CampaignListView({
  data,
  isLoading,
  onBoostClick,
}: CampaignListViewProps): ReactElement {
  const { campaign, post } = data;
  const date = useMemo(() => {
    const startedAt = new Date(campaign.startedAt);
    const endedAt = new Date(campaign.endedAt);
    const totalDays = getAbsoluteDifferenceInDays(endedAt, startedAt);

    const getEndsIn = () => {
      if (campaign.status === 'ACTIVE') {
        return getAbsoluteDifferenceInDays(endedAt, new Date());
      }

      return totalDays;
    };

    return {
      endsIn: getEndsIn(),
      startedIn: getAbsoluteDifferenceInDays(new Date(), startedAt),
      totalDays,
    };
  }, [campaign]);

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
          >
            {post.title}
          </Typography>
        </span>
        <Image src={post.image} className="h-12 w-18 rounded-12 object-cover" />
        <Button icon={<LinkIcon />} variant={ButtonVariant.Tertiary} />
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
          {campaign.status === 'ACTIVE' && (
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
          cores={campaign.budget}
          clicks={campaign.clicks}
          impressions={campaign.impressions}
          engagements={post.engagements}
        />
      </div>
      <div className="h-px w-full bg-border-subtlest-tertiary" />
      <div className="flex flex-col gap-2">
        <Typography type={TypographyType.Body}>Summary</Typography>
        <Typography type={TypographyType.Callout}>
          <CoreIcon size={IconSize.Size16} /> {campaign.budget} |{' '}
          {date.totalDays} days
        </Typography>
      </div>
      <Button
        variant={ButtonVariant.Float}
        className="w-full"
        color={campaign.status === 'ACTIVE' && ButtonColor.Ketchup}
        icon={campaign.status !== 'ACTIVE' && <BeforeIcon secondary />}
        onClick={onBoostClick}
        disabled={isLoading}
        loading={isLoading}
      >
        {campaign.status === 'ACTIVE' ? 'Stop campaign' : 'Boost again'}
      </Button>
    </div>
  );
}
