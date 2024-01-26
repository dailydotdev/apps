import React, { ReactElement } from 'react';
import { ProfilePicture } from '../../ProfilePicture';
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
        {!!author && <ProfilePicture user={author} size="large" />}
        <SourceButton
          size="xsmall"
          source={source}
          className="absolute -bottom-2.5 -right-2.5"
        />
      </div>
    );
  }
  return (
    <div className="relative">
      <SourceButton size="large" source={source} />
      {!!author && (
        <ProfilePicture
          user={author}
          size="xsmall"
          className="-bottom-2.5 -right-2.5"
          absolute
        />
      )}
    </div>
  );
}
