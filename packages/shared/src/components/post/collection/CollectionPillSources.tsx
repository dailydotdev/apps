import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { Pill } from '../../Pill';
import { SourceAvatar, SourceAvatarProps } from '../../profile/source';
import { ProfilePictureGroup } from '../../ProfilePictureGroup';

interface CollectionPillSourcesProps {
  className?: string;
  sources: SourceAvatarProps['source'][];
  totalSources: number;
}
export const CollectionPillSources = ({
  className,
  sources,
  totalSources,
}: CollectionPillSourcesProps): ReactElement => {
  const hasSources = !!sources?.length;

  return (
    <div className={classNames(className, 'flex relative flex-row')}>
      {hasSources && (
        <ProfilePictureGroup
          className="hidden group-hover:flex"
          total={totalSources}
          size="medium"
        >
          {sources.map((source) => (
            <SourceAvatar
              className="border-2 !mr-0 border-theme-bg-primary"
              key={source.handle}
              source={source}
              size="medium"
            />
          ))}
        </ProfilePictureGroup>
      )}
      <Pill
        label="Collection"
        className={classNames(
          'inline-flex bg-theme-overlay-float-cabbage text-theme-color-cabbage',
          hasSources && 'group-hover:hidden',
        )}
      />
    </div>
  );
};
