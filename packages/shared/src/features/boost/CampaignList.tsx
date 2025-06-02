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
      Campaign Item
      <span className="flex flex-row items-center gap-2">
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
          className="line-clamp-2"
        >
          {campaign.title}
        </Typography>
      </span>
      <Typography
        tag={TypographyTag.Span}
        type={TypographyType.Footnote}
        className={classNames('rounded-6 p-1', {
          'text-actions-share-active': campaign.status === 'completed',
          'text-actions-downvote-active': campaign.status === 'cancelled',
          'text-actions-upvote-active': campaign.status === 'active',
        })}
        bold
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
