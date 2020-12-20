import React, { HTMLAttributes, ReactElement } from 'react';
import Link from 'next/link';
import styled from 'styled-components';

interface User {
  name: string;
  image: string;
  permalink: string;
}

export interface ProfileLinkProps extends HTMLAttributes<HTMLAnchorElement> {
  user: User;
}

const Anchor = styled.a`
  display: flex;
  align-items: center;
  text-decoration: none;
`;

export function ProfileLink({
  user,
  children,
  ...props
}: ProfileLinkProps): ReactElement {
  return (
    <Link href={user.permalink} passHref prefetch={false}>
      <Anchor title={`Go to ${user.name}'s profile`} {...props}>
        {children}
      </Anchor>
    </Link>
  );
}
