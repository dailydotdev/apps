import React, {
  HTMLAttributes,
  ReactElement,
  ReactNode,
  useContext,
  useState,
} from 'react';
import dynamic from 'next/dynamic';
import { Button } from './buttons/Button';
import ProgressiveEnhancementContext from '../contexts/ProgressiveEnhancementContext';
import AuthContext from '../contexts/AuthContext';
import PromotionalBanner from './PromotionalBanner';
import Logo from './Logo';
import ProfileButton from './profile/ProfileButton';
import Sidebar from './sidebar/Sidebar';
import MenuIcon from '../../icons/filled/hamburger.svg';
import useSidebarRendered from '../hooks/useSidebarRendered';

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

const MobileHeaderRankProgress = dynamic(
  () =>
    import(
      /* webpackChunkName: "mobileHeaderRankProgress" */ './MobileHeaderRankProgress'
    ),
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
  const { windowLoaded } = useContext(ProgressiveEnhancementContext);
  const { user, showLogin, loadingUser } = useContext(AuthContext);
  const [showGreeting, setShowGreeting] = useState(false);
  const { sidebarRendered } = useSidebarRendered();
  const [openMobileSidebar, setOpenMobileSidebar] = useState(false);

  return (
    <>
      <PromotionalBanner />
      <header className="flex relative laptop:fixed laptop:top-0 laptop:left-0 z-3 flex-row-reverse laptop:flex-row justify-between items-center py-3 px-4 tablet:px-8 laptop:px-4 laptop:w-full h-14 border-b bg-theme-bg-primary border-theme-divider-tertiary">
        {!sidebarRendered && <MobileHeaderRankProgress />}
        {mobileTitle && (
          <h3 className="block laptop:hidden typo-callout">{mobileTitle}</h3>
        )}
        {shouldShowLogo({ mobileTitle, sidebarRendered }) && windowLoaded && (
          <div className="flex flex-row">
            <Logo onLogoClick={onLogoClick} showGreeting={showGreeting} />
            {greeting && (
              <Greeting
                user={user}
                onEnter={() => setShowGreeting(true)}
                onExit={() => setShowGreeting(false)}
              />
            )}
          </div>
        )}
        {!sidebarRendered && (
          <Button
            className="btn-tertiary"
            iconOnly
            onClick={() => setOpenMobileSidebar(true)}
            icon={<MenuIcon />}
          />
        )}
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
      </header>
      <main className="flex flex-row laptop:pt-14">
        {!showOnlyLogo && (
          <Sidebar
            sidebarRendered={sidebarRendered}
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
