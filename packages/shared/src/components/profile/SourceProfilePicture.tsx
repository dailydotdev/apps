import React, { ReactElement } from 'react';
import { Source } from '../../graphql/sources';
import ConditionalWrapper from '../ConditionalWrapper';
import { ProfilePicture, ProfilePictureProps } from '../ProfilePicture';
import { ProfileLink } from './ProfileLink';
import { cloudinary } from '../../lib/image';
import { useRequestProtocol } from '../../hooks/useRequestProtocol';

interface SourceProfilePictureProps extends Omit<ProfilePictureProps, 'user'> {
  isLink?: boolean;
  source: Source;
}

function SourceProfilePicture({
  source,
  rounded = 'full',
  isLink,
  ...props
}: SourceProfilePictureProps): ReactElement {
  const { isCompanion } = useRequestProtocol();

  return (
    <ConditionalWrapper
      condition={!!isLink}
      wrapper={(children) => (
        <ProfileLink href={source.permalink}>{children}</ProfileLink>
      )}
    >
      <ProfilePicture
        {...props}
        rounded={rounded}
        user={{
          id: source.id,
          image: source.image,
          username: source.handle,
        }}
        fallbackSrc={cloudinary.squads.imageFallback}
        nativeLazyLoading={isCompanion}
      />
    </ConditionalWrapper>
  );
}

export default SourceProfilePicture;
