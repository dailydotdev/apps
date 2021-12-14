import React, {
  HTMLAttributes,
  ReactElement,
  ReactNode,
  useContext,
  useState,
} from 'react';
import dynamic from 'next/dynamic';
import { CSSTransition } from 'react-transition-group';
import classNames from 'classnames';
import { laptop } from '../styles/media';
import { Button } from './buttons/Button';
import ProgressiveEnhancementContext from '../contexts/ProgressiveEnhancementContext';
import AuthContext from '../contexts/AuthContext';
import PromotionalBanner from './PromotionalBanner';
import Logo from '../svg/Logo';
import LogoText from '../svg/LogoText';
import styles from './MainLayout.module.css';
import ProfileButton from './profile/ProfileButton';
import { LinkWithTooltip } from './tooltips/LinkWithTooltip';
import Sidebar from './sidebar/Sidebar';
import MenuIcon from '../../icons/filled/hamburger.svg';
import MobileHeaderRankProgress from './MobileHeaderRankProgress';
import useMedia from '../hooks/useMedia';

export const footerNavBarBreakpoint = laptop;
export interface MainLayoutProps extends HTMLAttributes<HTMLDivElement> {
  showOnlyLogo?: boolean;
  greeting?: boolean;
  mainPage?: boolean;
  additionalButtons?: ReactNode;
  activePage?: string;
  useNavButtonsNotLinks?: boolean;
  onLogoClick?: (e: React.MouseEvent) => unknown;
  enableSearch?: () => void;
  onNavTabClick?: (tab: string) => void;
  onShowDndClick?: () => unknown;
}

const Greeting = dynamic(
  () => import(/* webpackChunkName: "greeting" */ './Greeting'),
);

export default function MainLayout({
  children,
  showOnlyLogo,
  greeting,
  activePage,
  useNavButtonsNotLinks,
  onLogoClick,
  onNavTabClick,
  enableSearch,
  onShowDndClick,
}: MainLayoutProps): ReactElement {
  const { windowLoaded } = useContext(ProgressiveEnhancementContext);
  const { user, showLogin, loadingUser } = useContext(AuthContext);
  const [showGreeting, setShowGreeting] = useState(false);
  const showSidebar = useMedia(
    [footerNavBarBreakpoint.replace('@media ', '')],
    [true],
    false,
  );
  const [openMobileSidebar, setOpenMobileSidebar] = useState(false);

  return (
    <>
      <PromotionalBanner />
      <header className="flex relative laptop:fixed laptop:top-0 laptop:left-0 z-3 flex-row-reverse laptop:flex-row justify-between items-center py-3 px-4 tablet:px-8 laptop:px-4 laptop:w-full h-14 border-b bg-theme-bg-primary border-theme-divider-tertiary">
        {!showSidebar && <MobileHeaderRankProgress />}
        <LinkWithTooltip
          href={process.env.NEXT_PUBLIC_WEBAPP_URL}
          passHref
          prefetch={false}
          tooltip={{ placement: 'right', content: 'Home' }}
        >
          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */}
          <a className="flex items-center" onClick={onLogoClick}>
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
        </LinkWithTooltip>
        {windowLoaded && greeting && (
          <Greeting
            user={user}
            onEnter={() => setShowGreeting(true)}
            onExit={() => setShowGreeting(false)}
          />
        )}
        {!showSidebar && (
          <Button
            className="btn-tertiary"
            onClick={() => setOpenMobileSidebar(true)}
          >
            <MenuIcon />
          </Button>
        )}
        {!showOnlyLogo && !loadingUser && showSidebar && (
          <>
            {user ? (
              <ProfileButton
                onShowDndClick={onShowDndClick}
                onClick={!showSidebar ? () => setOpenMobileSidebar(true) : null}
              />
            ) : (
              <Button
                onClick={() => showLogin('main button')}
                className="btn-primary"
              >
                Login
              </Button>
            )}
          </>
        )}
      </header>
      <main className="flex flex-row laptop:pt-14">
        {!showOnlyLogo && (
          <Sidebar
            showSidebar={showSidebar}
            openMobileSidebar={openMobileSidebar}
            onNavTabClick={onNavTabClick}
            enableSearch={enableSearch}
            activePage={activePage}
            useNavButtonsNotLinks={useNavButtonsNotLinks}
            onShowDndClick={onShowDndClick}
            setOpenMobileSidebar={() => setOpenMobileSidebar(false)}
          />
        )}
        {children}
      </main>
    </>
  );
}
