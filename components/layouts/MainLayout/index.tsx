import React, {
  HTMLAttributes,
  ReactElement,
  ReactNode,
  useContext,
} from 'react';
import styled from 'styled-components/macro';
import Link from 'next/link';
import {
  size1,
  size1px,
  size2,
  size3,
  size4,
  size8,
  sizeN,
} from '../../../styles/sizes';
import LazyImage from '../../LazyImage';
import AuthContext from '../../AuthContext';
import { focusOutline } from '../../../styles/helpers';
import { laptop, tablet } from '../../../styles/media';
import BetaBadge from '../../svg/BetaBadge';
import { typoCallout } from '../../../styles/typography';
import DailyDevLogo from '../../svg/DailyDevLogo';
import dynamicPageLoad from '../../../lib/dynamicPageLoad';
import TertiaryButton from '../../buttons/TertiaryButton';

const MainLayoutButtons = dynamicPageLoad(
  () =>
    import(/* webpackChunkName: "secondPhaseButtons"*/ './SecondPhaseButtons'),
  'complete',
);

export interface MainLayoutProps extends HTMLAttributes<HTMLDivElement> {
  showOnlyLogo?: boolean;
  responsive?: boolean;
}

export const headerHeight = sizeN(12);

const Container = styled.div`
  display: flex;
  position: relative;
  flex-direction: column;
  align-items: stretch;
`;

const Header = styled.header<{ responsive: boolean }>`
  display: flex;
  height: ${headerHeight};
  align-items: center;
  padding: 0 ${size4};
  border-bottom: ${size1px} solid var(--theme-divider-tertiary);

  ${tablet} {
    padding-left: ${size8};
    padding-right: ${size8};
  }

  ${laptop} {
    padding-left: ${size4};
    padding-right: ${size4};

    ${({ responsive }) =>
      responsive &&
      `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    border-bottom: none;
    `}
  }

  & > :nth-child(2) {
    margin-left: auto;
  }
`;

const buttonMargin = sizeN(1.5);

const ProfileImage = styled.a`
  display: flex;
  align-items: center;
  overflow: hidden;
  margin-left: ${buttonMargin};
  padding: 0;
  color: var(--theme-label-primary);
  background: var(--theme-background-secondary);
  border: none;
  border-radius: ${size2};
  cursor: pointer;
  text-decoration: none;
  font-weight: bold;
  ${focusOutline}
  ${typoCallout}

  .img {
    width: ${size8};
    border-radius: ${size2};
  }

  span {
    margin: 0 ${size2} 0 ${size3};
  }
`;

const HomeLink = styled.a`
  display: flex;
  align-items: center;

  .logo {
    width: 6.25rem;
  }

  .badge {
    width: 1.875rem;
    margin-left: ${size1};
  }
`;

export default function MainLayout({
  children,
  className,
  showOnlyLogo = false,
  responsive = true,
}: MainLayoutProps): ReactElement {
  const { user, showLogin, loadingUser } = useContext(AuthContext);

  return (
    <Container className={className}>
      <Header responsive={responsive}>
        <Link href="/" passHref>
          <HomeLink title="Home">
            <DailyDevLogo />
            <BetaBadge className="badge" />
          </HomeLink>
        </Link>
        {!showOnlyLogo && !loadingUser && (
          <>
            <MainLayoutButtons />
            {user ? (
              <Link href={`/${user.username || user.id}`} passHref>
                <ProfileImage title="Go to your profile">
                  <span>{user.reputation ?? 0}</span>
                  <LazyImage
                    className="img"
                    imgSrc={user.image}
                    imgAlt="Your profile image"
                    ratio="100%"
                  />
                </ProfileImage>
              </Link>
            ) : (
              <TertiaryButton onClick={() => showLogin()}>Login</TertiaryButton>
            )}
          </>
        )}
      </Header>
      {children}
    </Container>
  );
}

export const getLayout = (
  page: ReactNode,
  pageProps?: Record<string, unknown>,
  layoutProps?: MainLayoutProps,
): ReactNode => <MainLayout {...layoutProps}>{page}</MainLayout>;
