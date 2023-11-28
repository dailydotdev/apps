import React, { ReactElement } from 'react';
import Pill from '../../Pill';
import { ProfilePicture, ProfilePictureGroup } from '../../ProfilePicture';
import { Source } from '../../../graphql/sources';

interface Props {
  collectionSources: Source[];
  hovered?: boolean;
}
export const CollectionCardHeader = ({
  collectionSources,
  hovered,
}: Props): ReactElement => {
  if (collectionSources && hovered) {
    return (
      <ProfilePictureGroup>
        {collectionSources.map((source) => (
          <ProfilePicture
            key={source.id}
            user={source}
            rounded="full"
            size="xlarge"
          />
        ))}
      </ProfilePictureGroup>
    );
  }

  return (
    <div className="flex relative flex-row gap-2 m-2 mb-3">
      <div className="relative">
        <Pill
          label="Collection"
          className="bg-theme-overlay-float-cabbage text-theme-color-cabbage"
        />
      </div>
    </div>
  );
};
