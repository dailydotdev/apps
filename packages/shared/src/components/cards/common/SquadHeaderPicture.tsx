import React, { ReactElement } from 'react';
import { ProfileImageSize } from '../../ProfilePicture';
import SourceButton from '../SourceButton';
import { Source } from '../../../graphql/sources';

interface SquadHeaderPictureProps {
  source: Source;
  reverse?: boolean;
}

export default function SquadHeaderPicture({
  source,
  reverse = false,
}: SquadHeaderPictureProps): ReactElement {
  if (reverse) {
    return (
      <div className="relative">
        <SourceButton
          size={ProfileImageSize.XSmall}
          source={source}
          className="absolute -bottom-2.5 -right-2.5"
        />
      </div>
    );
  }
  return (
    <div className="relative">
      <SourceButton size={ProfileImageSize.Large} source={source} />
    </div>
  );
}
