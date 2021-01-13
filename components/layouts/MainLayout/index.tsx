import React, {
  HTMLAttributes,
  ReactElement,
  ReactNode,
  useContext,
} from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import {
  size1,
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

export interface Props extends HTMLAttributes<HTMLDivElement> {
  showOnlyLogo?: boolean;
}

const Container = styled.div`
  display: flex;
  position: relative;
  flex-direction: column;
  align-items: stretch;
`;

const Header = styled.header`
  display: flex;
  height: ${sizeN(12)};
  align-items: center;
  padding: 0 ${size4};
  border-bottom: 0.063rem solid var(--theme-separator);

  ${tablet} {
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

export default function Index({
  children,
  className,
  showOnlyLogo = false,
}: Props): ReactElement {
  const { user, showLogin, loadingUser } = useContext(AuthContext);

  return (
    <Container className={className}>
      <Header>
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
              <TertiaryButton onClick={showLogin}>Login</TertiaryButton>
            )}
          </>
        )}
      </Header>
      {children}
    </Container>
  );
}

export const getLayout = (page: ReactNode): ReactNode => <Index>{page}</Index>;
