import React, {
  HTMLAttributes,
  ReactElement,
  ReactNode,
  useContext,
  useState,
} from 'react';
import Link from 'next/link';
import { LazyImage } from '@dailydotdev/shared/src/components/LazyImage';
import AuthContext from '../../contexts/AuthContext';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import BookmarkIcon from '@dailydotdev/shared/icons/bookmark.svg';
import LayoutIcon from '@dailydotdev/shared/icons/layout.svg';
import Logo from '@dailydotdev/shared/src/svg/Logo';
import LogoTextBeta from '@dailydotdev/shared/src/svg/LogoTextBeta';
import dynamic from 'next/dynamic';
import ProgressiveEnhancementContext from '../../contexts/ProgressiveEnhancementContext';
import styles from '../../styles/mainLayout.module.css';
import classed from '@dailydotdev/shared/src/lib/classed';
import { getTooltipProps } from '@dailydotdev/shared/src/lib/tooltip';
import classNames from 'classnames';
import { CSSTransition } from 'react-transition-group';
import Banner from '../Banner';

export interface MainLayoutProps extends HTMLAttributes<HTMLDivElement> {
  showOnlyLogo?: boolean;
  responsive?: boolean;
  showRank?: boolean;
  greeting?: boolean;
  mainPage?: boolean;
}

const HeaderRankProgress = dynamic(
  () =>
    import(
      /* webpackChunkName: "headerRankProgress" */ '../HeaderRankProgress'
    ),
);

const Settings = dynamic(
  () => import(/* webpackChunkName: "settings" */ '../Settings'),
);

const Greeting = dynamic(
  () => import(/* webpackChunkName: "greeting" */ '../Greeting'),
);

const HeaderButton = classed(Button, 'hidden mx-0.5 laptop:flex');

export default function MainLayout({
  children,
  showOnlyLogo,
  responsive = true,
  showRank,
  greeting,
  mainPage,
}: MainLayoutProps): ReactElement {
  const { windowLoaded } = useContext(ProgressiveEnhancementContext);
  const { user, showLogin, loadingUser } = useContext(AuthContext);
  const [showSettings, setShowSettings] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);

  const settingsButton = mainPage ? (
    <HeaderButton
      icon={<LayoutIcon />}
      {...getTooltipProps('Settings', { position: 'down' })}
      className="btn-tertiary"
      onClick={() => setShowSettings(!showSettings)}
      pressed={showSettings}
    />
  ) : undefined;

  return (
    <>
      {!responsive && <Banner />}
      <header
        className={`${
          styles.header
        } relative flex items-center px-4 border-b border-theme-divider-tertiary tablet:px-8 laptop:px-4 ${
          responsive
            ? 'laptop:absolute laptop:top-0 laptop:left-0 laptop:w-full laptop:border-b-0'
            : 'non-responsive-header'
        }`}
      >
        <Link href="/" passHref prefetch={false}>
          <a
            className="flex items-center"
            {...getTooltipProps('Home', { position: 'right' })}
          >
            <Logo className={styles.homeSvg} />
            <CSSTransition
              in={!showGreeting}
              timeout={500}
              classNames="fade"
              unmountOnExit
            >
              <LogoTextBeta
                className={classNames(
                  styles.homeSvg,
                  'hidden ml-1 laptop:block',
                )}
              />
            </CSSTransition>
          </a>
        </Link>
        {windowLoaded && greeting && (
          <Greeting
            user={user}
            onEnter={() => setShowGreeting(true)}
            onExit={() => setShowGreeting(false)}
          />
        )}
        <div className="flex-1" />
        {!showOnlyLogo &&
          !loadingUser &&
          (user ? (
            <>
              <Link href="/bookmarks" passHref prefetch={false}>
                <HeaderButton
                  tag="a"
                  icon={<BookmarkIcon />}
                  {...getTooltipProps('Bookmarks', { position: 'down' })}
                  className="btn-tertiary"
                />
              </Link>
              {settingsButton}
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
              <HeaderButton
                icon={<BookmarkIcon />}
                {...getTooltipProps('Bookmarks', { position: 'down' })}
                onClick={() => showLogin()}
              />
              {settingsButton}
              <Button onClick={() => showLogin()} className="btn-tertiary">
                Login
              </Button>
            </>
          ))}
        {showRank && windowLoaded && (
          <HeaderRankProgress className="absolute left-0 right-0 -bottom-px my-0 mx-auto z-rank transform translate-y-1/2" />
        )}
      </header>
      {showSettings && (
        <Settings
          panelMode={true}
          className="border-b border-theme-divider-tertiary"
        />
      )}
      {children}
    </>
  );
}

export const getLayout = (
  page: ReactNode,
  pageProps?: Record<string, unknown>,
  layoutProps?: MainLayoutProps,
): ReactNode => <MainLayout {...layoutProps}>{page}</MainLayout>;
