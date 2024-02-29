import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { PublicProfile } from '../../lib/user';
import JoinedDate from './JoinedDate';
import { Separator } from '../cards/common';
import { ReputationUserBadge } from '../ReputationUserBadge';
import { IconSize } from '../Icon';

export type UserMetadataProps = Pick<
  PublicProfile,
  'name' | 'username' | 'createdAt'
> &
  Partial<Pick<PublicProfile, 'reputation'>> & {
    className?: string;
  };

export function UserMetadata({
  name,
  username,
  createdAt,
  reputation,
  className,
}: UserMetadataProps): ReactElement {
  return (
    <div
      className={classNames(
        'flex flex-col text-theme-label-quaternary typo-caption2',
        className,
      )}
    >
      <div className="flex items-center">
        <h2 className="overflow-hidden text-ellipsis whitespace-nowrap font-bold text-theme-label-primary typo-title3">
          {name}
        </h2>
        {reputation && (
          <ReputationUserBadge
            className="ml-0.5 !typo-footnote"
            user={{ reputation }}
            iconProps={{ size: IconSize.XSmall }}
            disableTooltip
          />
        )}
      </div>
      <div className="flex items-center">
        <span className="overflow-hidden text-ellipsis whitespace-nowrap text-theme-label-secondary typo-footnote">
          @{username}
        </span>
        <Separator />
        <JoinedDate
          className="text-theme-label-quaternary typo-caption2"
          date={new Date(createdAt)}
        />
      </div>
    </div>
  );
}
