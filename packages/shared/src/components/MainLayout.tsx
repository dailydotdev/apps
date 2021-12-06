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
import Sidebar from './Sidebar';

export const footerNavBarBreakpoint = laptop;
export interface MainLayoutProps extends HTMLAttributes<HTMLDivElement> {
  showOnlyLogo?: boolean;
  greeting?: boolean;
  mainPage?: boolean;
  additionalButtons?: ReactNode;
  onLogoClick?: (e: React.MouseEvent) => unknown;
  onShowDndClick?: () => unknown;
}

const Greeting = dynamic(
  () => import(/* webpackChunkName: "greeting" */ './Greeting'),
);

export default function MainLayout({
  children,
  showOnlyLogo,
  greeting,
  onLogoClick,
  onShowDndClick,
}: MainLayoutProps): ReactElement {
  const { windowLoaded } = useContext(ProgressiveEnhancementContext);
  const { user, showLogin, loadingUser } = useContext(AuthContext);
  const [showGreeting, setShowGreeting] = useState(false);

  return (
    <>
      <PromotionalBanner />
      <header className="flex relative items-center py-3 px-4 tablet:px-8 laptop:px-4 border-b border-theme-divider-tertiary non-responsive-header">
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
        {!showOnlyLogo && <Sidebar />}
        {children}
      </main>
    </>
  );
}
