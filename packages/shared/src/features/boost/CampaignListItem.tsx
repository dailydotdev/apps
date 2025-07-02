import classNames from 'classnames';
import type { MouseEventHandler, PropsWithChildren, ReactElement } from 'react';
import React from 'react';
import { IconSize, iconSizeToClassName } from '../../components/Icon';
import { ArrowIcon } from '../../components/icons';
import {
  Typography,
  TypographyType,
  TypographyColor,
  TypographyTag,
} from '../../components/typography/Typography';
import { Image } from '../../components/image/Image';
import { getAbsoluteDifferenceInDays } from './utils';
import type { BoostedPostData, PromotedPost } from '../../graphql/post/boost';

const statusToColor: Record<PromotedPost['status'], string> = {
  ACTIVE: 'bg-action-upvote-active text-action-upvote-default',
  COMPLETED: 'bg-action-share-active text-action-share-default',
  CANCELLED: 'bg-action-downvote-active text-action-downvote-default',
};

export const BoostStatus = ({
  children,
  status,
}: PropsWithChildren<{
  status: PromotedPost['status'];
}>) => (
  <Typography
    tag={TypographyTag.Span}
    type={TypographyType.Footnote}
    className={classNames(
      'rounded-6 px-1',
      statusToColor[status] ?? statusToColor.ACTIVE,
    )}
  >
    {children}
  </Typography>
);

interface CampaignListItemProps {
  data: BoostedPostData;
  onClick: MouseEventHandler<HTMLButtonElement>;
}

export function CampaignListItem({
  data,
  onClick,
}: CampaignListItemProps): ReactElement {
  const { campaign, post } = data;

  const getCaption = () => {
    if (campaign.status === 'COMPLETED') {
      return 'Completed';
    }

    if (campaign.status === 'CANCELLED') {
      return 'Cancelled';
    }

    const remainingDays = getAbsoluteDifferenceInDays(
      new Date(campaign.endedAt),
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
        {post.image && (
          <Image
            src={post.image}
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
          {post.title}
        </Typography>
      </span>
      <BoostStatus status={campaign.status}>{getCaption()}</BoostStatus>
      <ArrowIcon size={IconSize.Medium} className="rotate-90" />
    </button>
  );
}
