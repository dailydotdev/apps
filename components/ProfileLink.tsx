import React, { HTMLAttributes, ReactElement } from 'react';
import styled from 'styled-components';
import { size10 } from '../styles/sizes';
import LazyImage from './LazyImage';

interface User {
  name: string;
  image: string;
  permalink: string;
}

export interface ProfileLinkProps extends HTMLAttributes<HTMLAnchorElement> {
  user: User;
}

const Container = styled.a`
  display: block;
  width: ${size10};
  height: ${size10};
`;

const Image = styled(LazyImage)`
  width: 100%;
  height: 100%;
  border-radius: 100%;
`;

export function ProfileLink({
  user,
  ...props
}: ProfileLinkProps): ReactElement {
  return (
    <Container
      href={user.permalink}
      title={`Go to ${user.name}'s profile`}
      {...props}
    >
      <Image
        imgSrc={user.image}
        imgAlt={`${user.name}'s profile image`}
        background="var(--theme-background-highlight)"
      />
    </Container>
  );
}
