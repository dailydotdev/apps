import React, { ReactElement } from 'react';
import styled from 'styled-components';
import { size10 } from '../../styles/sizes';
import LazyImage from '../LazyImage';
import { ProfileLink, ProfileLinkProps } from './ProfileLink';

const Container = styled(ProfileLink)`
  display: block;
  width: ${size10};
  height: ${size10};
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
