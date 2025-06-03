import type { MouseEventHandler, ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { PostCampaign } from '../../hooks/post/usePostBoost';
import { Image } from '../../components/image/Image';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../components/typography/Typography';
import { IconSize, iconSizeToClassName } from '../../components/Icon';
import { ArrowIcon } from '../../components/icons';
import { BoostIcon } from '../../components/icons/Boost';

interface CampaignListItemProps {
  campaign: PostCampaign;
  onClick: MouseEventHandler<HTMLButtonElement>;
}

const CampaignListItem = ({ campaign, onClick }: CampaignListItemProps) => {
  const getCaption = () => {
    if (campaign.status === 'completed') {
      return 'Completed';
    }

    if (campaign.status === 'cancelled') {
      return 'Cancelled';
    }

    const remainingDays = Math.ceil(
      (new Date(campaign.boostedUntil).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24),
    );

    return `${remainingDays} days left`;
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full flex-row items-center gap-4"
    >
      <span className="flex flex-1 flex-row items-center gap-2">
        {campaign.image && (
          <Image
            src={campaign.image}
            className={classNames(
              'rounded-12 object-cover',
              iconSizeToClassName[IconSize.Size48],
            )}
          />
        )}
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
          className="line-clamp-2 flex-1 text-left"
        >
          {campaign.title}
        </Typography>
      </span>
      <Typography
        tag={TypographyTag.Span}
        type={TypographyType.Footnote}
        className={classNames('rounded-6 px-1', {
          'bg-action-share-active text-action-share-default':
            campaign.status === 'completed',
          'bg-action-downvote-active text-action-downvote-default':
            campaign.status === 'cancelled',
          'bg-action-upvote-active text-action-upvote-default':
            campaign.status === 'active',
        })}
      >
        {getCaption()}
      </Typography>
      <ArrowIcon size={IconSize.Medium} className="rotate-90" />
    </button>
  );
};

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
