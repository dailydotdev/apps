import type { ReactElement } from 'react';
import React from 'react';
import type { Source } from '../../graphql/sources';
import ConditionalWrapper from '../ConditionalWrapper';
import type { ProfilePictureProps } from '../ProfilePicture';
import { ProfilePicture } from '../ProfilePicture';
import { ProfileLink } from './ProfileLink';
import { cloudinarySquadsImageFallback } from '../../lib/image';
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
        fallbackSrc={cloudinarySquadsImageFallback}
        nativeLazyLoading={isCompanion}
      />
    </ConditionalWrapper>
  );
}

export default SourceProfilePicture;
