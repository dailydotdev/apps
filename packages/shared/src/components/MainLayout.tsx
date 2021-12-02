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
import styles from './MainLayout.module.css';
import ProfileButton from './profile/ProfileButton';
import useSidebarMenu from '../hooks/useSidebarMenu';

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

const Greeting = dynamic(
  () => import(/* webpackChunkName: "greeting" */ './Greeting'),
);

export const HeaderButton = classed(Button, 'hidden mx-0.5 laptop:flex');

export default function MainLayout({
  children,
  showOnlyLogo,
  responsive = true,
  greeting,
  onLogoClick,
  onShowDndClick,
}: MainLayoutProps): ReactElement {
  const { windowLoaded } = useContext(ProgressiveEnhancementContext);
  const { user, showLogin, loadingUser } = useContext(AuthContext);
  const [showGreeting, setShowGreeting] = useState(false);
  const { sidebarOpen, setSidebarOpen } = useSidebarMenu();

  return (
    <>
      {!responsive && <PromotionalBanner />}
      <header
        className={`${
          styles.header
        } relative flex items-center px-4 border-b border-theme-divider-tertiary tablet:px-8 laptop:px-4 py-2 ${
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
              <ProfileButton onShowDndClick={onShowDndClick} />
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
      <main className="flex flex-row">
        <aside
          className="bg-theme-float transform"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{ width: sidebarOpen ? 240 : 44 }}
        >
          Sidebar
        </aside>
        {children}
      </main>
    </>
  );
}
