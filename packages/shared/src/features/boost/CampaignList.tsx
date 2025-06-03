import type { ReactElement } from 'react';
import React from 'react';
import type { PostCampaign } from '../../hooks/post/usePostBoost';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../components/typography/Typography';
import { IconSize } from '../../components/Icon';
import { BoostIcon } from '../../components/icons/Boost';
import { CampaignListItem } from './CampaignListItem';

interface CampaignListProps {
  list: PostCampaign[];
  onClick?: (campaign: PostCampaign) => void;
}

export function CampaignList({
  list,
  onClick,
}: CampaignListProps): ReactElement {
  if (!list?.length) {
    return (
      <div className="flex flex-col items-center gap-4">
        <BoostIcon className="text-text-disabled" size={IconSize.XXLarge} />
        <Typography type={TypographyType.Title2} bold>
          Ads dashboard
        </Typography>
        <Typography
          color={TypographyColor.Tertiary}
          type={TypographyType.Callout}
          className="text-center"
        >
          Once you boost a post, you’ll see real-time insights here—like views,
          clicks, and engagement metrics.
        </Typography>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {list.map((campaign) => (
        <CampaignListItem
          key={campaign.id}
          campaign={campaign}
          onClick={() => onClick(campaign)}
        />
      ))}
    </div>
  );
}
