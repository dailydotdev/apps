import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../components/typography/Typography';
import type { PostCampaign } from '../../hooks/post/usePostBoost';
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

interface CampaignListViewProps {
  campaign: PostCampaign;
}

export function CampaignListView({
  campaign,
}: CampaignListViewProps): ReactElement {
  const date = useMemo(() => {
    const getEndsIn = () => {
      if (campaign.status === 'active') {
        return getAbsoluteDifferenceInDays(campaign.boostedUntil, new Date());
      }

      return getAbsoluteDifferenceInDays(
        campaign.boostedUntil,
        campaign.createdAt,
      );
    };

    const totalDays = getAbsoluteDifferenceInDays(
      campaign.boostedUntil,
      campaign.createdAt,
    );

    return {
      endsIn: getEndsIn(),
      startedIn: getAbsoluteDifferenceInDays(new Date(), campaign.createdAt),
      totalDays,
    };
  }, [campaign]);

  return (
    <div className="flex flex-col gap-6 p-2">
      <div className="flex flex-row items-center gap-4">
        <span className="flex flex-1 flex-row">
          <Typography
            type={TypographyType.Callout}
            className="line-clamp-3 flex-1"
          >
            {campaign.title}
          </Typography>
        </span>
        <Image src={campaign.image} className="h-12 w-18 rounded-12" />
        <Button icon={<LinkIcon />} variant={ButtonVariant.Tertiary} />
      </div>
      <div className="flex flex-col gap-1">
        <ProgressBar percentage={date.startedIn / date.totalDays} />
        <span className="flex flex-row justify-between">
          <Typography
            type={TypographyType.Subhead}
            color={TypographyColor.Secondary}
          >
            Started {date.startedIn} days ago
          </Typography>
          <Typography
            type={TypographyType.Subhead}
            color={TypographyColor.Secondary}
          >
            Ends in {date.endsIn} days
          </Typography>
        </span>
        <div className="mt-3 grid grid-cols-2 gap-4">
          <DataTile
            label="Ads cost"
            value={campaign.cost}
            icon={<CoreIcon size={IconSize.XSmall} />}
          />
          <DataTile label="Ads views" value={campaign.views} />
          <DataTile label="Comments" value={campaign.comments} />
          <DataTile label="Upvotes" value={campaign.upvotes} />
        </div>
      </div>
      <div className="h-px w-full bg-border-subtlest-tertiary" />
      <div className="flex flex-col gap-2">
        <Typography type={TypographyType.Body}>Summary</Typography>
        <Typography type={TypographyType.Callout}>
          <CoreIcon size={IconSize.Size16} /> {campaign.cost} | {date.totalDays}{' '}
          days
        </Typography>
      </div>
      <Button
        variant={ButtonVariant.Float}
        className="w-full"
        color={campaign.status === 'active' && ButtonColor.Ketchup}
        icon={campaign.status !== 'active' && <BeforeIcon />}
      >
        {campaign.status === 'active' ? 'Stop campaign' : 'Boost again'}
      </Button>
    </div>
  );
}
