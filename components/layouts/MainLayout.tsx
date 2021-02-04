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
import { headerHeight } from '../../styles/sizes';
import sizeN from '../../macros/sizeN.macro';
import rem from '../../macros/rem.macro';
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

const buttonMargin = sizeN(0.5);

const ProfileImage = styled.a`
  display: flex;
  align-items: center;
  overflow: hidden;
  margin-left: ${buttonMargin};
  padding: 0;
  color: var(--theme-label-primary);
  background: var(--theme-background-secondary);
  border: none;
  border-radius: ${sizeN(2)};
  cursor: pointer;
  text-decoration: none;
  font-weight: bold;
  ${focusOutline}
  ${typoCallout}

  .img {
    width: ${sizeN(8)};
    border-radius: ${sizeN(2)};
  }

  span {
    margin: 0 ${sizeN(2)} 0 ${sizeN(3)};
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
      margin-left: ${sizeN(1)};

      ${laptop} {
        display: unset;
      }
    }
  }

  .badge {
    width: 1.875rem;
    margin-left: ${sizeN(1)};
  }
`;

const Header = styled.header<{ responsive: boolean }>`
  position: relative;
  display: flex;
  height: ${headerHeight};
  align-items: center;
  padding: 0 ${sizeN(4)};
  border-bottom: ${rem(1)} solid var(--theme-divider-tertiary);

  ${tablet} {
    padding-left: ${sizeN(8)};
    padding-right: ${sizeN(8)};
  }

  ${laptop} {
    padding-left: ${sizeN(4)};
    padding-right: ${sizeN(4)};

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
        {!showOnlyLogo &&
          !loadingUser &&
          (user ? (
            <>
              <Link href="/bookmarks" passHref prefetch={false}>
                <BookmarksButton
                  tag="a"
                  icon={<BookmarkIcon />}
                  title="Bookmarks"
                />
              </Link>
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
            </>
          ) : (
            <>
              <BookmarksButton
                icon={<BookmarkIcon />}
                title="Bookmarks"
                onClick={() => showLogin()}
              />
              <TertiaryButton onClick={() => showLogin()}>Login</TertiaryButton>
            </>
          ))}
        {showRank && (
          <HeaderRankProgress
            css={css`
              position: absolute;
              left: 0;
              right: 0;
              bottom: -${rem(1)};
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
