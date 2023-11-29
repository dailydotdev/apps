import React, { ReactElement } from 'react';
import Pill from '../../Pill';
import { SourceAvatar, SourceAvatarProps } from '../../profile/source';
import { ProfilePictureGroup } from '../../ProfilePictureGroup';

interface Props {
  sources: SourceAvatarProps['source'][];
  totalSources: number;
  hovered?: boolean;
}
export const CollectionCardHeader = ({
  sources,
  totalSources,
  hovered = false,
}: Props): ReactElement => {
  const shouldShowSources = hovered && sources.length > 0;

  return (
    <div className="flex relative flex-row gap-2 m-2 mb-3">
      <div className="relative">
        {shouldShowSources && (
          <ProfilePictureGroup total={totalSources} size="medium">
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
        {!shouldShowSources && (
          <Pill
            label="Collection"
            className="bg-theme-overlay-float-cabbage text-theme-color-cabbage"
          />
        )}
      </div>
    </div>
  );
};
