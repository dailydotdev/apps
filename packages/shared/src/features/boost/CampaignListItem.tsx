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
import { Image } from '../../components/image/Image';
import { getAbsoluteDifferenceInDays } from './utils';
import type { Campaign } from '../../graphql/campaigns';
import { isNullOrUndefined } from '../../lib/func';

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

export function CampaignListItem({
  campaign,
  className,
  onClick,
}: CampaignListItemProps): ReactElement {
  const { post } = campaign;

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
        <span className="flex flex-1">
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Secondary}
            className="line-clamp-2 flex-1 text-left"
            style={{ lineBreak: 'anywhere' }}
          >
            {post.title}
          </Typography>
        </span>
      </span>
      <BoostStatus status={campaign.state} remainingDays={getRemaining()} />
      <ArrowIcon size={IconSize.Medium} className="rotate-90" />
    </button>
  );
}
