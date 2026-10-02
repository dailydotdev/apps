import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { ProfileImageRoundSize } from './ProfilePicture';
import { ProfileImageSize, roundClasses, sizeClasses } from './ProfilePicture';

export type ProfilePictureGroupChildProps = {
  itemId: string;
};

export type ProfilePictureGroupProps = {
  className?: string;
  total?: number;
  limit?: number;
  size?: ProfileImageSize;
  // The count takes the shape of the pictures: people are rounded squares,
  // sources pass `full`.
  rounded?: ProfileImageRoundSize;
  children:
    | React.ReactElement<ProfilePictureGroupChildProps>[]
    | React.ReactElement<ProfilePictureGroupChildProps>;
};

export const ProfilePictureGroup = ({
  className,
  total,
  limit = 3,
  size = ProfileImageSize.Large,
  rounded = size,
  children,
}: ProfilePictureGroupProps): ReactElement => {
  const childrenMap = React.Children.toArray(children).slice(
    0,
    limit,
  ) as React.ReactElement[];
  const remainingCount = total ? total - childrenMap.length : 0;

  if (remainingCount) {
    childrenMap.push(
      <div
        className={classNames(
          sizeClasses[size],
          roundClasses[rounded],
          'flex items-center justify-center bg-theme-active font-bold typo-caption1',
        )}
      >
        +{remainingCount}
      </div>,
    );
  }
  return (
    <div className={classNames(className, 'flex items-center')}>
      {childrenMap.map((child, index) => {
        return (
          <div
            key={child.key || index}
            style={{
              zIndex: childrenMap.length - index,
            }}
            className={classNames(index > 0 && '-ml-1.5')}
          >
            {child}
          </div>
        );
      })}
    </div>
  );
};
