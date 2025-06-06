import React from 'react';
import type { ReactNode } from 'react';
import classNames from 'classnames';
import { Image } from '../../image/Image';
import { FollowButton } from '../../contentPreference/FollowButton';
import type { ContentPreferenceType } from '../../../graphql/contentPreference';

export type EntityCardProps = {
  image: string;
  type: 'user' | 'source';
  children?: ReactNode;
  entityId: string;
  entityName?: string;
};

const EntityCard = ({
  image,
  children,
  type,
  entityId,
  entityName,
}: EntityCardProps) => {
  return (
    <div className="flex min-w-36  flex-col items-center gap-3 rounded-16 bg-background-popover p-4">
      <div className="flex w-full items-center gap-2">
        <div
          className={classNames(
            'overflow-hidden',
            type === 'user' ? 'size-16 rounded-20' : 'size-10 rounded-full',
          )}
        >
          <Image src={image} alt="Entity" />
        </div>
        <div className="ml-auto">
          <FollowButton
            showSubscribe={false}
            entityId={entityId}
            type={type as ContentPreferenceType}
            entityName={entityName}
          />
        </div>
        <div />
      </div>
      {children}
    </div>
  );
};

export default EntityCard;
