import React, {
  HTMLAttributes,
  ReactElement,
  ReactNode,
  useContext,
  useState,
} from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { CSSTransition } from 'react-transition-group';
import classNames from 'classnames';
import classed from '../lib/classed';
import { Button } from './buttons/Button';
import ProgressiveEnhancementContext from '../contexts/ProgressiveEnhancementContext';
import AuthContext from '../contexts/AuthContext';
import { getTooltipProps } from '../lib/tooltip';
import PromotionalBanner from './PromotionalBanner';
import Logo from '../svg/Logo';
import LogoText from '../svg/LogoText';
import BookmarkIcon from '../../icons/bookmark.svg';
import { LazyImage } from './LazyImage';
import styles from './MainLayout.module.css';
import LayoutIcon from '../../icons/layout.svg';
import { useContextMenu } from 'react-contexify';
import useProfileMenu from '../hooks/useProfileMenu';

export interface MainLayoutProps extends HTMLAttributes<HTMLDivElement> {
  showOnlyLogo?: boolean;
  responsive?: boolean;
  showRank?: boolean;
  greeting?: boolean;
  mainPage?: boolean;
  additionalButtons?: ReactNode;
  onLogoClick?: (e: React.MouseEvent) => unknown;
  onShowDndClick?: () => unknown;
}

const ProfileMenu = dynamic(
  () => import(/* webpackChunkName: "profileMenu" */ './ProfileMenu'),
);

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

export const HeaderButton = classed(Button, 'hidden mx-0.5 laptop:flex');

export default function MainLayout({
  children,
  showOnlyLogo,
  responsive = true,
  showRank,
  greeting,
  mainPage,
  additionalButtons,
  onLogoClick,
  onShowDndClick,
}: MainLayoutProps): ReactElement {
  const { windowLoaded } = useContext(ProgressiveEnhancementContext);
  const { user, showLogin, loadingUser } = useContext(AuthContext);
  const [showSettings, setShowSettings] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const { onMenuClick } = useProfileMenu();

  const afterBookmarkButtons = (
    <>
      {additionalButtons}
      {mainPage && (
        <HeaderButton
          icon={<LayoutIcon />}
          {...getTooltipProps('Settings', { position: 'down' })}
          className="btn-tertiary"
          onClick={() => setShowSettings(!showSettings)}
          pressed={showSettings}
        />
      )}
    </>
  );

  return (
    <>
      {!responsive && <PromotionalBanner />}
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
          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */}
          <a
            className="flex items-center"
            onClick={onLogoClick}
            {...getTooltipProps('Home', { position: 'right' })}
          >
            <Logo className={styles.homeSvg} />
            <CSSTransition
              in={!showGreeting}
              timeout={500}
              classNames="fade"
              unmountOnExit
            >
              <LogoText
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
        {!showOnlyLogo && !loadingUser && (
          <>
            {user ? (
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
                {afterBookmarkButtons}
                <a
                  className="flex items-center ml-0.5 p-0 text-theme-label-primary bg-theme-bg-secondary border-none rounded-lg cursor-pointer no-underline font-bold typo-callout focus-outline"
                  {...getTooltipProps('Profile', {
                    position: 'left',
                  })}
                  onClick={onMenuClick}
                >
                  <span className="ml-3 mr-2">{user.reputation ?? 0}</span>
                  <LazyImage
                    className="w-8 h-8 rounded-lg"
                    imgSrc={user.image}
                    imgAlt="Your profile image"
                  />
                </a>
                <ProfileMenu onShowDndClick={onShowDndClick} />
              </>
            ) : (
              <>
                <HeaderButton
                  icon={<BookmarkIcon />}
                  {...getTooltipProps('Bookmarks', { position: 'down' })}
                  onClick={() => showLogin('bookmark')}
                  className="btn-tertiary"
                />
                {afterBookmarkButtons}
                <Button
                  onClick={() => showLogin('main button')}
                  className="btn-primary"
                >
                  Login
                </Button>
              </>
            )}
          </>
        )}
        {showRank && windowLoaded && (
          <HeaderRankProgress className="absolute left-0 right-0 mx-auto my-0 transform translate-y-1/2 -bottom-px z-rank" />
        )}
      </header>
      {showSettings && (
        <Settings
          panelMode
          className="border-b border-theme-divider-tertiary"
        />
      )}
      {children}
    </>
  );
}
