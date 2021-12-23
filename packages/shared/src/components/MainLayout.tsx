import React, {
  HTMLAttributes,
  ReactElement,
  ReactNode,
  useContext,
  useState,
} from 'react';
import dynamic from 'next/dynamic';
import classNames from 'classnames';
import { Button } from './buttons/Button';
import AuthContext from '../contexts/AuthContext';
import PromotionalBanner from './PromotionalBanner';
import Logo from './Logo';
import ProfileButton from './profile/ProfileButton';
import Sidebar from './sidebar/Sidebar';
import MenuIcon from '../../icons/filled/hamburger.svg';
import useSidebarRendered from '../hooks/useSidebarRendered';
import AnalyticsContext from '../contexts/AnalyticsContext';
import MobileHeaderRankProgress from './MobileHeaderRankProgress';
import { LoggedUser } from '../lib/user';
import usePromotionalBanner from '../hooks/usePromotionalBanner';
import { useSwipeableSidebar } from '../hooks/useSwipeableSidebar';

export interface MainLayoutProps extends HTMLAttributes<HTMLDivElement> {
  showOnlyLogo?: boolean;
  greeting?: boolean;
  mainPage?: boolean;
  additionalButtons?: ReactNode;
  activePage?: string;
  useNavButtonsNotLinks?: boolean;
  mobileTitle?: string;
  onLogoClick?: (e: React.MouseEvent) => unknown;
  enableSearch?: () => void;
  onNavTabClick?: (tab: string) => void;
  onShowDndClick?: () => unknown;
}

const Greeting = dynamic(
  () => import(/* webpackChunkName: "greeting" */ './Greeting'),
);

interface ShouldShowLogoProps {
  mobileTitle?: string;
  sidebarRendered?: boolean;
}
const shouldShowLogo = ({
  mobileTitle,
  sidebarRendered,
}: ShouldShowLogoProps) => {
  return !mobileTitle ? true : mobileTitle && sidebarRendered;
};

interface LogoAndGreetingProps {
  user?: LoggedUser;
  greeting?: boolean;
  onLogoClick?: (e: React.MouseEvent) => unknown;
}
const LogoAndGreeting = ({
  user,
  onLogoClick,
  greeting,
}: LogoAndGreetingProps) => {
  const [showGreeting, setShowGreeting] = useState(false);

  return (
    <>
      <Logo onLogoClick={onLogoClick} showGreeting={showGreeting} />
      {greeting && (
        <Greeting
          user={user}
          onEnter={() => setShowGreeting(true)}
          onExit={() => setShowGreeting(false)}
        />
      )}
    </>
  );
};

export default function MainLayout({
  children,
  showOnlyLogo,
  greeting,
  activePage,
  useNavButtonsNotLinks,
  mobileTitle,
  onLogoClick,
  onNavTabClick,
  enableSearch,
  onShowDndClick,
}: MainLayoutProps): ReactElement {
  const { user, showLogin, loadingUser } = useContext(AuthContext);
  const { trackEvent } = useContext(AnalyticsContext);
  const { sidebarRendered } = useSidebarRendered();
  const { bannerData, setLastSeen } = usePromotionalBanner();
  const [openMobileSidebar, setOpenMobileSidebar] = useState(false);
  const handlers = useSwipeableSidebar({
    sidebarRendered,
    openMobileSidebar,
    setOpenMobileSidebar,
  });

  const trackAndToggleMobileSidebar = (state: boolean) => {
    trackEvent({
      event_name: `${state ? 'open' : 'close'} sidebar`,
    });
    setOpenMobileSidebar(state);
  };

  return (
    <div {...handlers}>
      <PromotionalBanner bannerData={bannerData} setLastSeen={setLastSeen} />
      <header
        className={classNames(
          'flex relative laptop:fixed laptop:left-0 z-3 flex-row laptop:flex-row justify-between items-center py-3 px-4 tablet:px-8 laptop:px-4 laptop:w-full h-14 border-b bg-theme-bg-primary border-theme-divider-tertiary',
          bannerData?.banner ? 'laptop:top-8' : 'laptop:top-0',
        )}
      >
        {sidebarRendered !== undefined && (
          <>
            {sidebarRendered === false && (
              <Button
                className="btn-tertiary"
                iconOnly
                onClick={() => trackAndToggleMobileSidebar(true)}
                icon={<MenuIcon />}
              />
            )}
            <div className="flex flex-row flex-1 justify-center laptop:justify-start">
              {mobileTitle && (
                <h3 className="block laptop:hidden typo-callout">
                  {mobileTitle}
                </h3>
              )}
              {shouldShowLogo({ mobileTitle, sidebarRendered }) && (
                <LogoAndGreeting
                  user={user}
                  onLogoClick={onLogoClick}
                  greeting={greeting}
                />
              )}
            </div>
            {!showOnlyLogo && !loadingUser && sidebarRendered && (
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
            {sidebarRendered === false && <MobileHeaderRankProgress />}
          </>
        )}
      </header>
      <main
        className={classNames(
          'flex flex-row',
          bannerData?.banner ? 'laptop:pt-22' : 'laptop:pt-14',
        )}
      >
        {!showOnlyLogo && sidebarRendered !== null && (
          <Sidebar
            promotionalBannerActive={!!bannerData?.banner}
            sidebarRendered={sidebarRendered}
            openMobileSidebar={openMobileSidebar}
            onNavTabClick={onNavTabClick}
            enableSearch={enableSearch}
            activePage={activePage}
            useNavButtonsNotLinks={useNavButtonsNotLinks}
            onShowDndClick={onShowDndClick}
            setOpenMobileSidebar={() => trackAndToggleMobileSidebar(false)}
          />
        )}
        {children}
      </main>
    </div>
  );
}
