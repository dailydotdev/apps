import React, {
  HTMLAttributes,
  ReactElement,
  ReactNode,
  useContext,
} from 'react';
import styled from '@emotion/styled';
import Link from 'next/link';
import {
  size05,
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
import { laptop, tablet } from '../../styles/media';
import BetaBadge from '../svg/BetaBadge';
import { typoCallout } from '../../styles/typography';
import DailyDevLogo from '../svg/DailyDevLogo';
import TertiaryButton from '../buttons/TertiaryButton';
import { ButtonProps } from '../buttons/BaseButton';
import BookmarkIcon from '../../icons/bookmark.svg';
import { footerNavBarBreakpoint } from './FooterNavBarLayout';

export interface MainLayoutProps extends HTMLAttributes<HTMLDivElement> {
  showOnlyLogo?: boolean;
  responsive?: boolean;
}

export const headerHeight = sizeN(12);

const buttonMargin = size05;

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
  margin-right: auto;

  .logo {
    width: 6.25rem;
  }

  .badge {
    width: 1.875rem;
    margin-left: ${size1};
  }
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
`;

const BookmarksButton = styled(TertiaryButton)<ButtonProps<'a'>>`
  display: none;
  margin: 0 ${buttonMargin};

  ${footerNavBarBreakpoint} {
    display: flex;
  }
`;

export default function MainLayout({
  children,
  showOnlyLogo = false,
  responsive = true,
}: MainLayoutProps): ReactElement {
  const { user, showLogin, loadingUser } = useContext(AuthContext);

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
            <Link href="/bookmarks" passHref prefetch={false}>
              <BookmarksButton
                tag="a"
                icon={<BookmarkIcon />}
                title="Bookmarks"
              />
            </Link>
            {user ? (
              <Link
                href={`/${user.username || user.id}`}
                passHref
                prefetch={false}
              >
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
