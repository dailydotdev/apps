import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../components/typography/Typography';
import { IconSize } from '../../components/Icon';
import { BoostIcon } from '../../components/icons/Boost';
import { CampaignListItem } from './CampaignListItem';
import type { BoostedPostData } from '../../graphql/post/boost';

interface CampaignListProps {
  list: BoostedPostData[];
  onClick?: (campaign: BoostedPostData) => void;
}

export function CampaignList({
  list,
  onClick,
}: CampaignListProps): ReactElement {
  if (!list?.length) {
    return (
      <div className="flex flex-col items-center gap-4">
        <BoostIcon
          secondary
          className="text-text-disabled"
          size={IconSize.XXLarge}
        />
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
    <div className="-mx-6 flex flex-1 flex-col overflow-x-hidden">
      {list.map((data) => (
        <CampaignListItem
          key={data.campaign.campaignId}
          data={data}
          onClick={() => onClick(data)}
          className="px-6 py-2"
        />
      ))}
    </div>
  );
}
