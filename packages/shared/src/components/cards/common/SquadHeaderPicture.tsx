import React, { ReactElement } from 'react';
import { ProfileImageSize, ProfilePicture } from '../../ProfilePicture';
import SourceButton from '../SourceButton';
import { Author } from '../../../graphql/comments';
import { Source } from '../../../graphql/sources';

interface SquadHeaderPictureProps {
  author?: Author;
  source: Source;
  reverse?: boolean;
}

export default function SquadHeaderPicture({
  author,
  source,
  reverse = false,
}: SquadHeaderPictureProps): ReactElement {
  if (reverse) {
    return (
      <div className="relative">
        {!!author && (
          <ProfilePicture user={author} size={ProfileImageSize.Large} />
        )}
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
      {!!author && (
        <ProfilePicture
          user={author}
          size={ProfileImageSize.XSmall}
          className="-bottom-2.5 -right-2.5"
          absolute
        />
      )}
    </div>
  );
}
