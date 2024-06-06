import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { Pill } from '../../Pill';
import { SourceAvatar, SourceAvatarProps } from '../../profile/source';
import { ProfilePictureGroup } from '../../ProfilePictureGroup';
import { ProfileImageSize } from '../../ProfilePicture';

interface CollectionPillSourcesProps {
  className?: {
    main?: string;
    avatar?: string;
  };
  sources: SourceAvatarProps['source'][];
  alwaysShowSources?: boolean;
  totalSources: number;
}
export const CollectionPillSources = ({
  className,
  sources,
  totalSources,
  alwaysShowSources = false,
}: CollectionPillSourcesProps): ReactElement => {
  const hasSources = !!sources?.length;

  return (
    <div
      className={classNames(
        className?.main,
        'pointer-events-none relative flex flex-row',
      )}
    >
      {hasSources && (
        <ProfilePictureGroup
          className={classNames({
            'hidden group-hover:flex': !alwaysShowSources,
          })}
          total={totalSources}
          size={ProfileImageSize.Medium}
        >
          {sources.map((source) => (
            <SourceAvatar
              className={classNames(
                '-my-0.5 !mr-0 box-content border-2 border-background-default',
                className?.avatar,
              )}
              key={source.handle}
              source={source}
              size={ProfileImageSize.Medium}
            />
          ))}
        </ProfilePictureGroup>
      )}
      {(!hasSources || !alwaysShowSources) && (
        <Pill
          label="Collection"
          className={classNames(
            'inline-flex bg-theme-overlay-float-cabbage text-brand-default',
            hasSources && 'group-hover:hidden',
          )}
        />
      )}
    </div>
  );
};
