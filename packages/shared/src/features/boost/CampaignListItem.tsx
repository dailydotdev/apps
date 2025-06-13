import classNames from 'classnames';
import type { MouseEventHandler, ReactElement } from 'react';
import React from 'react';
import { IconSize, iconSizeToClassName } from '../../components/Icon';
import { ArrowIcon } from '../../components/icons';
import {
  Typography,
  TypographyType,
  TypographyColor,
  TypographyTag,
} from '../../components/typography/Typography';
import type { PostCampaign } from '../../hooks/post/usePostBoost';
import { Image } from '../../components/image/Image';
import { getAbsoluteDifferenceInDays } from './utils';

const statusToColor: Record<PostCampaign['status'], string> = {
  active: 'bg-action-upvote-active text-action-upvote-default',
  completed: 'bg-action-share-active text-action-share-default',
  cancelled: 'bg-action-downvote-active text-action-downvote-default',
};

interface CampaignListItemProps {
  campaign: PostCampaign;
  onClick: MouseEventHandler<HTMLButtonElement>;
}

export function CampaignListItem({
  campaign,
  onClick,
}: CampaignListItemProps): ReactElement {
  const getCaption = () => {
    if (campaign.status === 'completed') {
      return 'Completed';
    }

    if (campaign.status === 'cancelled') {
      return 'Cancelled';
    }

    const remainingDays = getAbsoluteDifferenceInDays(
      new Date(campaign.boostedUntil),
      new Date(),
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
        className={classNames('rounded-6 px-1', statusToColor[campaign.status])}
      >
        {getCaption()}
      </Typography>
      <ArrowIcon size={IconSize.Medium} className="rotate-90" />
    </button>
  );
}
