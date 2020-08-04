import React, { ReactElement, ReactNode } from 'react';
import styled from 'styled-components';
import { size05, size10, size4, size7 } from '../styles/sizes';
import { FloatButton } from './Buttons';
import DailyDevLogo from './DailyDevLogo';
import { AnonymousUser, LoggedUser } from '../lib/user';
import LazyImage from './LazyImage';
import { colorWater40 } from '../styles/colors';

export interface Props {
  children?: ReactNode;
  isLoggedIn: boolean;
  user: AnonymousUser | LoggedUser;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const Header = styled.header`
  display: flex;
  height: ${size10};
  align-items: center;
  justify-content: space-between;
  padding: 0 ${size4};
  border-bottom: 0.063rem solid var(--theme-separator);
`;

const ProfileImage = styled.button`
  width: ${size7};
  overflow: hidden;
  padding: 0;
  background: none;
  border-radius: 100%;
  border: ${size05} solid transparent;

  &:focus {
    outline: none;
    border-color: ${colorWater40};
  }
`;

export default function MainLayout({
  children,
  isLoggedIn,
  user,
}: Props): ReactElement {
  return (
    <Container>
      <Header>
        <a href="https://daily.dev">
          <DailyDevLogo />
        </a>
        {isLoggedIn ? (
          <ProfileImage>
            <LazyImage
              src={(user as LoggedUser).image}
              alt="Your profile image"
              ratio="100%"
            />
          </ProfileImage>
        ) : (
          <FloatButton>Login</FloatButton>
        )}
      </Header>
      {children}
    </Container>
  );
}
