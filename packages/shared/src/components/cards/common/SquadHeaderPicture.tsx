import React, { ReactElement } from 'react';
import { ProfileImageSize, ProfilePicture } from '../../ProfilePicture';
import SourceButton from '../SourceButton';
import { Author } from '../../../graphql/comments';
import { Source } from '../../../graphql/sources';
import { useConditionalFeature } from '../../../hooks';
import { feature } from '../../../lib/featureManagement';

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
  const { value: shouldShowNewAuthorImage } = useConditionalFeature({
    shouldEvaluate: !!author,
    feature: feature.authorImage,
  });
  const shouldShowAuthor = !!author && !shouldShowNewAuthorImage;

  if (reverse) {
    return (
      <div className="relative">
        {shouldShowAuthor && (
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
      {shouldShowAuthor && (
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
