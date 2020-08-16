import React, { ReactElement, ReactNode, useContext } from 'react';
import styled from 'styled-components';
import { size1, size10, size4, size6, size8, sizeN } from '../styles/sizes';
import { FloatButton } from './Buttons';
import DailyDevLogo from './DailyDevLogo';
import LazyImage from './LazyImage';
import AuthContext from './AuthContext';
import { focusOutline } from '../styles/utilities';
import { laptop, tablet } from '../styles/media';
import BetaBadge from './BetaBadge';

export interface Props {
  children?: ReactNode;
}

const Container = styled.div`
  display: flex;
  position: relative;
  flex-direction: column;
  align-items: stretch;

  .logo {
    width: 5.75rem;
  }
`;

const Header = styled.header`
  display: flex;
  height: ${size10};
  align-items: center;
  justify-content: space-between;
  padding: 0 ${size4};
  border-bottom: 0.063rem solid var(--theme-separator);

  ${tablet} {
    height: ${sizeN(12)};
    padding-left: ${size8};
    padding-right: ${size8};
  }

  ${laptop} {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    padding-left: ${size4};
    padding-right: ${size4};
    border-bottom: none;
  }
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

const HomeLink = styled.a`
  display: flex;
  align-items: center;

  .badge {
    width: 30px;
    margin-left: ${size1};
  }
`;

export default function MainLayout({ children }: Props): ReactElement {
  const { user, showLogin } = useContext(AuthContext);

  return (
    <Container>
      <Header>
        <HomeLink href="https://daily.dev">
          <DailyDevLogo />
          <BetaBadge className="badge" />
        </HomeLink>
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
