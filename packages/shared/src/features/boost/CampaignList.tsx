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
import { boostDocsLink } from '../../lib/constants';
import type { Campaign } from '../../graphql/campaigns';

interface CampaignListProps {
  list: Campaign[];
  onClick?: (campaign: Campaign) => void;
  infiniteScrollingProps: InfiniteScrollingQueryProps;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function CampaignList({
  list,
  onClick,
  infiniteScrollingProps,
  emptyTitle = 'No boosts yet',
  emptyDescription = 'Boost a post from its menu, or your Squad from its page, to reach more developers.',
}: CampaignListProps): ReactElement {
  if (!list?.length) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-16 border border-border-subtlest-tertiary px-6 py-8 text-center">
        <BoostIcon
          secondary
          className="text-text-tertiary"
          size={IconSize.XLarge}
        />
        <Typography type={TypographyType.Callout} bold>
          {emptyTitle}
        </Typography>
        <Typography
          color={TypographyColor.Tertiary}
          type={TypographyType.Footnote}
        >
          {emptyDescription}
        </Typography>
        <a
          href={boostDocsLink}
          className="mt-1 text-text-link typo-footnote"
          target="_blank"
          rel="noopener"
        >
          How boosting works
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
          onClick={() => onClick?.(campaign)}
          className="px-6 py-2.5"
        />
      ))}
    </InfiniteScrolling>
  );
}
