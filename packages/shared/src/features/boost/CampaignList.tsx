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
import type { InfiniteScrollingQueryProps } from '../../components/containers/InfiniteScrolling';
import InfiniteScrolling from '../../components/containers/InfiniteScrolling';
import { BoostHistoryLoading } from './BoostHistoryLoading';
import { boostPostDocsLink } from '../../lib/constants';
import type { Campaign } from '../../graphql/campaigns';

interface CampaignListProps {
  list: Campaign[];
  onClick?: (campaign: Campaign) => void;
  infiniteScrollingProps: InfiniteScrollingQueryProps;
}

export function CampaignList({
  list,
  onClick,
  infiniteScrollingProps,
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
          No running ads yet
        </Typography>
        <Typography
          color={TypographyColor.Tertiary}
          type={TypographyType.Callout}
          className="text-center"
        >
          Learn how boosting works and launch your first campaign to get
          discovered by more developers.
        </Typography>
        <a
          href={boostPostDocsLink}
          className="mt-3 text-text-link typo-callout"
          target="_blank"
        >
          Learn more about boosting
        </a>
      </div>
    );
  }

  return (
    <InfiniteScrolling
      {...infiniteScrollingProps}
      placeholder={<BoostHistoryLoading />}
      className="-mx-6 flex-1 overflow-x-hidden"
    >
      {list.map((campaign) => (
        <CampaignListItem
          key={campaign.id}
          campaign={campaign}
          onClick={() => onClick(campaign)}
          className="px-6 py-2"
        />
      ))}
    </InfiniteScrolling>
  );
}
