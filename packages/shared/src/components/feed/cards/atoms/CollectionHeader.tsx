import classNames from 'classnames';
import React, { ReactElement } from 'react';
import { ProfilePictureGroup } from '../../../ProfilePictureGroup';
import { SourceAvatar, SourceAvatarProps } from '../../../profile/source';
import { Pill } from '../../../Pill';

export const CollectionHeader = ({
  sources,
  totalSources,
}: {
  sources: SourceAvatarProps['source'][];
  totalSources: number;
}): ReactElement => {
  const hasSources = !!sources?.length;

  return (
    <div className="relative m-2 mb-3 flex flex-row">
      {hasSources && (
        <ProfilePictureGroup
          className="hidden group-hover/card:flex"
          total={totalSources}
          size="medium"
        >
          {sources.map((source) => (
            <SourceAvatar
              className="!mr-0 border-2 border-theme-bg-primary"
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
          hasSources && 'group-hover/card:hidden',
        )}
      />
    </div>
  );
};
