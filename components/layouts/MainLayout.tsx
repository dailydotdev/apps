import React, {
  HTMLAttributes,
  ReactElement,
  ReactNode,
  useContext,
} from 'react';
import Link from 'next/link';
import LazyImage from '../LazyImage';
import AuthContext from '../../contexts/AuthContext';
import Button from '../buttons/Button';
import BookmarkIcon from '../../icons/bookmark.svg';
import Logo from '../svg/Logo';
import LogoTextBeta from '../svg/LogoTextBeta';
import dynamic from 'next/dynamic';
import ProgressiveEnhancementContext from '../../contexts/ProgressiveEnhancementContext';
import styles from '../../styles/mainLayout.module.css';
import classed from '../../lib/classed';
import { getTooltipProps } from '../../lib/tooltip';

export interface MainLayoutProps extends HTMLAttributes<HTMLDivElement> {
  showOnlyLogo?: boolean;
  responsive?: boolean;
  showRank?: boolean;
}

const HeaderRankProgress = dynamic(
  () =>
    import(
      /* webpackChunkName: "headerRankProgress" */ '../HeaderRankProgress'
    ),
);

const BookmarksButton = classed(Button, 'hidden mx-0.5 laptop:flex');

export default function MainLayout({
  children,
  showOnlyLogo = false,
  responsive = true,
  showRank = false,
}: MainLayoutProps): ReactElement {
  const { windowLoaded } = useContext(ProgressiveEnhancementContext);
  const { user, showLogin, loadingUser } = useContext(AuthContext);

  return (
    <>
      <header
        className={`${
          styles.header
        } relative border-b flex items-center px-4 border-theme-divider-tertiary tablet:px-8 laptop:px-4 ${
          responsive
            ? 'laptop:absolute laptop:top-0 laptop:left-0 laptop:w-full laptop:border-b-0'
            : ''
        }`}
      >
        <Link href="/" passHref prefetch={false}>
          <a
            className="flex items-center mr-auto"
            {...getTooltipProps('Home', { position: 'right' })}
          >
            <Logo className={styles.homeSvg} />
            <LogoTextBeta
              className={`${styles.homeSvg} hidden ml-1 laptop:block`}
            />
          </a>
        </Link>
        {!showOnlyLogo &&
          !loadingUser &&
          (user ? (
            <>
              <Link href="/bookmarks" passHref prefetch={false}>
                <BookmarksButton
                  tag="a"
                  icon={<BookmarkIcon />}
                  {...getTooltipProps('Bookmarks', { position: 'down' })}
                  className="btn-tertiary"
                />
              </Link>
              <Link
                href={`/${user.username || user.id}`}
                passHref
                prefetch={false}
              >
                <a
                  className="flex items-center ml-0.5 p-0 text-theme-label-primary bg-theme-bg-secondary border-none rounded-lg cursor-pointer no-underline font-bold typo-callout focus-outline"
                  {...getTooltipProps('Profile', {
                    position: 'left',
                  })}
                >
                  <span className="mr-2 ml-3">{user.reputation ?? 0}</span>
                  <LazyImage
                    className="w-8 h-8 rounded-lg"
                    imgSrc={user.image}
                    imgAlt="Your profile image"
                  />
                </a>
              </Link>
            </>
          ) : (
            <>
              <BookmarksButton
                icon={<BookmarkIcon />}
                {...getTooltipProps('Bookmarks', { position: 'down' })}
                onClick={() => showLogin()}
              />
              <Button onClick={() => showLogin()} className="btn-tertiary">
                Login
              </Button>
            </>
          ))}
        {showRank && windowLoaded && (
          <HeaderRankProgress className="absolute left-0 right-0 -bottom-px my-0 mx-auto z-rank transform translate-y-1/2" />
        )}
      </header>
      {children}
    </>
  );
}

export const getLayout = (
  page: ReactNode,
  pageProps?: Record<string, unknown>,
  layoutProps?: MainLayoutProps,
): ReactNode => <MainLayout {...layoutProps}>{page}</MainLayout>;
