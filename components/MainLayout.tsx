import React, { ReactElement, ReactNode, useContext } from 'react';
import styled from 'styled-components';
import { size10, size4, size6 } from '../styles/sizes';
import { FloatButton } from './Buttons';
import DailyDevLogo from './DailyDevLogo';
import LazyImage from './LazyImage';
import AuthContext from './AuthContext';
import { focusOutline } from '../styles/utilities';

export interface Props {
  children?: ReactNode;
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
  width: ${size6};
  overflow: hidden;
  padding: 0;
  background: none;
  border: none;
  border-radius: 100%;
  ${focusOutline}
`;

export default function MainLayout({ children }: Props): ReactElement {
  const { user, showLogin } = useContext(AuthContext);

  return (
    <Container>
      <Header>
        <a href="https://daily.dev">
          <DailyDevLogo />
        </a>
        {user ? (
          <ProfileImage>
            <LazyImage
              imgSrc={user.image}
              imgAlt="Your profile image"
              ratio="100%"
            />
          </ProfileImage>
        ) : (
          <FloatButton onClick={showLogin}>Login</FloatButton>
        )}
      </Header>
      {children}
    </Container>
  );
}
