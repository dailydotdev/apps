import classNames from 'classnames';
import type { MouseEventHandler, ReactElement } from 'react';
import React from 'react';
import { IconSize } from '../../components/Icon';
import { ArrowIcon, CoreIcon } from '../../components/icons';
import {
  Typography,
  TypographyType,
  TypographyTag,
} from '../../components/typography/Typography';
import { getAbsoluteDifferenceInDays } from './utils';
import type { Campaign } from '../../graphql/campaigns';
import { CampaignType } from '../../graphql/campaigns';
import { isNullOrUndefined } from '../../lib/func';
import { largeNumberFormat } from '../../lib';
import { BoostTarget } from './BoostTarget';

const statusToClassName: Record<Campaign['state'], string> = {
  ACTIVE: 'bg-action-upvote-float text-status-success',
  COMPLETED: 'bg-surface-float text-text-secondary',
  CANCELLED: 'bg-surface-float text-text-tertiary',
};

export const BoostStatus = ({
  status,
  remainingDays,
}: {
  status: Campaign['state'];
  remainingDays?: number;
}): ReactElement => {
  const copy = (() => {
    switch (status) {
      case 'ACTIVE':
        if (isNullOrUndefined(remainingDays)) {
          return 'Active';
        }

        return `${remainingDays} ${remainingDays === 1 ? 'day' : 'days'} left`;
      case 'COMPLETED':
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
      type={TypographyType.Caption1}
      bold
      className={classNames(
        'shrink-0 whitespace-nowrap rounded-8 px-2 py-0.5',
        statusToClassName[status] ?? statusToClassName.ACTIVE,
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
  const isActive = campaign.state === 'ACTIVE';
  const remainingDays = isActive
    ? getAbsoluteDifferenceInDays(new Date(campaign.endedAt), new Date())
    : undefined;
  const isPost = campaign.type === CampaignType.Post;

  return (
    <button
      type="button"
      onClick={onClick}
      className={classNames(
        'flex w-full flex-row items-center gap-3 text-left hover:bg-surface-hover',
        className,
      )}
    >
      <BoostTarget
        post={isPost ? campaign.post : undefined}
        squad={isPost ? undefined : campaign.source}
        className="flex-1"
        subtitle={
          <span className="flex items-center gap-1">
            <CoreIcon size={IconSize.XXSmall} />
            {largeNumberFormat(campaign.flags?.spend || 0)} spent ·{' '}
            {largeNumberFormat(campaign.flags?.users || 0)} reached
          </span>
        }
      />
      <BoostStatus status={campaign.state} remainingDays={remainingDays} />
      <ArrowIcon
        size={IconSize.Small}
        className="shrink-0 rotate-90 text-text-tertiary"
      />
    </button>
  );
}
