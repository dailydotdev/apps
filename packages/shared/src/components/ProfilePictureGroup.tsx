import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { ProfileImageSize, sizeClasses } from './ProfilePicture';

export type ProfilePictureGroupChildProps = {
  itemId: string;
};

export type ProfilePictureGroupProps = {
  className?: string;
  total?: number;
  limit?: number;
  size?: ProfileImageSize;
  children:
    | React.ReactElement<ProfilePictureGroupChildProps>[]
    | React.ReactElement<ProfilePictureGroupChildProps>;
};

export const ProfilePictureGroup = ({
  className,
  total,
  limit = 3,
  size = 'large',
  children,
}: ProfilePictureGroupProps): ReactElement => {
  const childrenMap = React.Children.toArray(children).slice(0, limit);
  const remainingCount = total ? total - childrenMap.length : 0;

  if (remainingCount) {
    childrenMap.push(
      <div
        className={classNames(
          sizeClasses[size],
          'flex items-center justify-center rounded-full font-bold bg-theme-active typo-caption1',
        )}
      >
        +{remainingCount}
      </div>,
    );
  }
  return (
    <div className={classNames(className, 'flex')}>
      {childrenMap.map(
        (child: React.ReactElement<ProfilePictureGroupChildProps>, index) => {
          return (
            <div
              key={child.key || index}
              style={{
                zIndex: childrenMap.length - index,
              }}
              className={classNames(index > 0 && '-ml-[5%]')}
            >
              {child}
            </div>
          );
        },
      )}
    </div>
  );
};
