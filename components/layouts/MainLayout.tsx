import React, {
  HTMLAttributes,
  ReactElement,
  ReactNode,
  useContext,
} from 'react';
import styled from '@emotion/styled';
import Link from 'next/link';
import {
  size1,
  size1px,
  size2,
  size3,
  size4,
  size8,
  sizeN,
} from '../../styles/sizes';
import LazyImage from '../LazyImage';
import AuthContext from '../AuthContext';
import { focusOutline } from '../../styles/helpers';
import { laptop, laptopL, tablet } from '../../styles/media';
import BetaBadge from '../svg/BetaBadge';
import { typoCallout } from '../../styles/typography';
import DailyDevLogo from '../svg/DailyDevLogo';
import TertiaryButton from '../buttons/TertiaryButton';
import usePersistentState from '../../lib/usePersistentState';
import QuandaryButton from '../buttons/QuandaryButton';
import { ButtonProps } from '../buttons/BaseButton';
import GiftIcon from '../../icons/gift.svg';

export interface MainLayoutProps extends HTMLAttributes<HTMLDivElement> {
  showOnlyLogo?: boolean;
  responsive?: boolean;
}

export const headerHeight = sizeN(12);

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

const GiftButton = styled(QuandaryButton)<ButtonProps<'a'>>`
  margin: 0 ${buttonMargin};
`;

export default function MainLayout({
  children,
  showOnlyLogo = false,
  responsive = true,
}: MainLayoutProps): ReactElement {
  const { user, showLogin, loadingUser } = useContext(AuthContext);

  const [didClickedTshirt, setDidClickTshirt] = usePersistentState(
    'tshirt',
    true,
    false,
  );

  return (
    <>
      <Header responsive={responsive}>
        <Link href="/" passHref prefetch={false}>
          <HomeLink title="Home">
            <DailyDevLogo />
            <BetaBadge className="badge" />
          </HomeLink>
        </Link>
        {!showOnlyLogo && !loadingUser && (
          <>
            <GiftButton
              id="header-gift-btn"
              tag="a"
              href="https://daily.dev/win-free-t-shirt"
              target="_blank"
              rel="noopener"
              title="Get free T-shirt"
              themeColor="avocado"
              pressed={!didClickedTshirt}
              onClick={() => setDidClickTshirt(true)}
              icon={<GiftIcon />}
              reverse
              labelMediaQuery={laptopL}
            >
              {!didClickedTshirt && 'Get free T-shirt'}
            </GiftButton>
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
    </>
  );
}

export const getLayout = (
  page: ReactNode,
  pageProps?: Record<string, unknown>,
  layoutProps?: MainLayoutProps,
): ReactNode => <MainLayout {...layoutProps}>{page}</MainLayout>;
