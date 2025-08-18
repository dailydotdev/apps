import classNames from 'classnames';
import type { MouseEventHandler, PropsWithChildren, ReactElement } from 'react';
import React from 'react';
import { IconSize } from '../../components/Icon';
import { ArrowIcon } from '../../components/icons';
import {
  Typography,
  TypographyType,
  TypographyTag,
} from '../../components/typography/Typography';
import { getAbsoluteDifferenceInDays } from './utils';
import type { Campaign } from '../../graphql/campaigns';
import { CampaignType } from '../../graphql/campaigns';
import { isNullOrUndefined } from '../../lib/func';
import { CampaignListItemPost } from './CampaignListItemPost';
import { CampaignListItemSquad } from './CampaignListItemSquad';

const statusToColor: Record<Campaign['state'], string> = {
  ACTIVE: 'bg-action-upvote-active text-action-upvote-default',
  INACTIVE: 'bg-action-share-active text-action-share-default',
  CANCELLED: 'bg-surface-float text-text-secondary',
};

export const BoostStatus = ({
  status,
  remainingDays,
}: {
  status: Campaign['state'];
  remainingDays?: number;
}) => {
  const copy = (() => {
    switch (status) {
      case 'ACTIVE':
        if (isNullOrUndefined(remainingDays)) {
          return 'Active';
        }

        return `${remainingDays} ${remainingDays === 1 ? 'day' : 'days'} left`;
      case 'INACTIVE':
        return 'Completed';
      case 'CANCELLED':
        return 'Stopped';
      default:
        return 'Unknown';
    }
  })();

  return (
    <Typography
      tag={TypographyTag.Span}
      type={TypographyType.Footnote}
      className={classNames(
        'rounded-6 px-1',
        statusToColor[status] ?? statusToColor.ACTIVE,
      )}
    >
      {copy}
    </Typography>
  );
};

interface CampaignListItemProps {
  campaign: Campaign;
  className?: string;
  onClick: MouseEventHandler<HTMLButtonElement>;
}

const PreviewComponent = ({
  campaign,
}: PropsWithChildren<{ campaign: Campaign }>) => {
  switch (campaign.type) {
    case CampaignType.Post:
      return <CampaignListItemPost post={campaign.post} />;
    case CampaignType.Source:
      return <CampaignListItemSquad squad={campaign.source} />;
    default:
      return null;
  }
};

export function CampaignListItem({
  campaign,
  className,
  onClick,
}: CampaignListItemProps): ReactElement {
  const getRemaining = () => {
    if (campaign.state !== 'ACTIVE') {
      return undefined;
    }

    return getAbsoluteDifferenceInDays(new Date(campaign.endedAt), new Date());
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={classNames(
        'flex w-full flex-row items-center gap-4 hover:bg-surface-hover',
        className,
      )}
    >
      <PreviewComponent campaign={campaign} />
      <BoostStatus status={campaign.state} remainingDays={getRemaining()} />
      <ArrowIcon size={IconSize.Medium} className="rotate-90" />
    </button>
  );
}
