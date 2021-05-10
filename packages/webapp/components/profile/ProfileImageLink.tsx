import React, { ReactElement } from 'react';
import styled from '@emotion/styled';
import sizeN from '../../macros/sizeN.macro';
import { LazyImage } from '@dailydotdev/shared';
import { ProfileLink, ProfileLinkProps } from './ProfileLink';

const Container = styled(ProfileLink)`
  display: block;
  width: ${sizeN(10)};
  height: ${sizeN(10)};
`;

const Image = styled(LazyImage)`
  width: 100%;
  height: 100%;
  border-radius: 100%;
`;

export function ProfileImageLink(props: ProfileLinkProps): ReactElement {
  return (
    <Container {...props}>
      <Image
        imgSrc={props.user.image}
        imgAlt={`${props.user.name}'s profile image`}
        background="var(--theme-background-secondary)"
      />
    </Container>
  );
}
