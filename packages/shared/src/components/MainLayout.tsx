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
import { ForwardedButton as Button } from './buttons/Button';
import ProgressiveEnhancementContext from '../contexts/ProgressiveEnhancementContext';
import AuthContext from '../contexts/AuthContext';
import PromotionalBanner from './PromotionalBanner';
import Logo from '../svg/Logo';
import LogoText from '../svg/LogoText';
import BookmarkIcon from '../../icons/bookmark.svg';
import styles from './MainLayout.module.css';
import LayoutIcon from '../../icons/layout.svg';
import ProfileButton from './profile/ProfileButton';

const LazyTooltip = dynamic(() => import('./tooltips/Tooltip'));

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

  const afterBookmarkButtons = (
    <>
      {additionalButtons}
      {mainPage && (
        <LazyTooltip content="Settings" placement="bottom">
          <HeaderButton
            icon={<LayoutIcon />}
            className="btn-tertiary"
            onClick={() => setShowSettings(!showSettings)}
            pressed={showSettings}
          />
        </LazyTooltip>
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
          <LazyTooltip content="Home" placement="right">
            <a
              href={process.env.NEXT_PUBLIC_WEBAPP_URL}
              className="flex items-center"
              onClick={onLogoClick}
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
          </LazyTooltip>
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
                  <LazyTooltip content="Bookmarks" placement="bottom">
                    <HeaderButton
                      tag="a"
                      icon={<BookmarkIcon />}
                      className="btn-tertiary"
                    />
                  </LazyTooltip>
                </Link>
                {afterBookmarkButtons}
                <ProfileButton onShowDndClick={onShowDndClick} />
              </>
            ) : (
              <>
                <LazyTooltip content="Bookmarks" placement="bottom">
                  <HeaderButton
                    icon={<BookmarkIcon />}
                    onClick={() => showLogin('bookmark')}
                    className="btn-tertiary"
                  />
                </LazyTooltip>
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
