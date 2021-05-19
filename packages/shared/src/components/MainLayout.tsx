import React, {
  HTMLAttributes,
  ReactElement,
  useContext,
  useState,
} from 'react';
import classed from '../lib/classed';
import { Button } from './buttons/Button';
import dynamic from 'next/dynamic';
import ProgressiveEnhancementContext from '../contexts/ProgressiveEnhancementContext';
import AuthContext from '../contexts/AuthContext';
import { getTooltipProps } from '../lib/tooltip';
import Banner from './Banner';
import Logo from '../svg/Logo';
import LogoTextBeta from '../svg/LogoTextBeta';
import BookmarkIcon from '../../icons/bookmark.svg';
import { LazyImage } from './LazyImage';
import styles from './MainLayout.module.css';
import LayoutIcon from '../../icons/layout.svg';
import Link from 'next/link';
import { CSSTransition } from 'react-transition-group';
import classNames from 'classnames';

export interface MainLayoutProps extends HTMLAttributes<HTMLDivElement> {
  showOnlyLogo?: boolean;
  responsive?: boolean;
  showRank?: boolean;
  greeting?: boolean;
  mainPage?: boolean;
}

const HeaderRankProgress = dynamic(
  () =>
    import(/* webpackChunkName: "headerRankProgress" */ './HeaderRankProgress'),
);

const Settings = dynamic(
  () => import(/* webpackChunkName: "settings" */ './Settings'),
);

const Greeting = dynamic(
  () => import(/* webpackChunkName: "greeting" */ './Greeting'),
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
        <Link
          href={process.env.NEXT_PUBLIC_WEBAPP_URL}
          passHref
          prefetch={false}
        >
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
              <Link
                href={`${process.env.NEXT_PUBLIC_WEBAPP_URL}bookmarks`}
                passHref
                prefetch={false}
              >
                <HeaderButton
                  tag="a"
                  icon={<BookmarkIcon />}
                  {...getTooltipProps('Bookmarks', { position: 'down' })}
                  className="btn-tertiary"
                />
              </Link>
              {settingsButton}
              <Link
                href={`${process.env.NEXT_PUBLIC_WEBAPP_URL}${
                  user.username || user.id
                }`}
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
                className="btn-tertiary"
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
