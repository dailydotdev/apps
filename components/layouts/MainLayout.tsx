/** @jsx jsx */
import { jsx, css } from '@emotion/react';
import React, {
  HTMLAttributes,
  ReactElement,
  ReactNode,
  useContext,
} from 'react';
import styled from '@emotion/styled';
import Link from 'next/link';
import {
  headerHeight,
  size05,
  size1,
  size1px,
  size2,
  size3,
  size4,
  size8,
} from '../../styles/sizes';
import LazyImage from '../LazyImage';
import AuthContext from '../AuthContext';
import { focusOutline } from '../../styles/helpers';
import { laptop, tablet } from '../../styles/media';
import { typoCallout } from '../../styles/typography';
import TertiaryButton from '../buttons/TertiaryButton';
import { ButtonProps } from '../buttons/BaseButton';
import BookmarkIcon from '../../icons/bookmark.svg';
import { footerNavBarBreakpoint } from './FooterNavBarLayout';
import dynamicPageLoad from '../../lib/dynamicPageLoad';
import Logo from '../svg/Logo';
import LogoTextBeta from '../svg/LogoTextBeta';

export interface MainLayoutProps extends HTMLAttributes<HTMLDivElement> {
  showOnlyLogo?: boolean;
  responsive?: boolean;
  showRank?: boolean;
}

const HeaderRankProgress = dynamicPageLoad(
  () =>
    import(
      /* webpackChunkName: "headerRankProgress" */ '../HeaderRankProgress'
    ),
);

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

  svg {
    height: 1.125rem;

    &:nth-of-type(2) {
      display: none;
      margin-left: ${size1};

      ${laptop} {
        display: unset;
      }
    }
  }

  .badge {
    width: 1.875rem;
    margin-left: ${size1};
  }
`;

const Header = styled.header<{ responsive: boolean }>`
  position: relative;
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
  showRank = false,
}: MainLayoutProps): ReactElement {
  const { user, showLogin, loadingUser } = useContext(AuthContext);

  return (
    <>
      <Header responsive={responsive}>
        <Link href="/" passHref prefetch={false}>
          <HomeLink title="Home">
            <Logo />
            <LogoTextBeta />
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
        {showRank && (
          <HeaderRankProgress
            css={css`
              position: absolute;
              left: 0;
              right: 0;
              bottom: -${size1px};
              margin: 0 auto;
              z-index: 3;
              transform: translateY(50%);
            `}
          />
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
