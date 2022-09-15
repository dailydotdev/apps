import React, {
  HTMLAttributes,
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import dynamic from 'next/dynamic';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import { Button } from './buttons/Button';
import AuthContext from '../contexts/AuthContext';
import PromotionalBanner from './PromotionalBanner';
import Logo from './Logo';
import ProfileButton from './profile/ProfileButton';
import Sidebar from './sidebar/Sidebar';
import MenuIcon from './icons/Hamburger';
import useSidebarRendered from '../hooks/useSidebarRendered';
import AnalyticsContext from '../contexts/AnalyticsContext';
import MobileHeaderRankProgress from './MobileHeaderRankProgress';
import { LoggedUser } from '../lib/user';
import usePromotionalBanner from '../hooks/usePromotionalBanner';
import { useSwipeableSidebar } from '../hooks/useSwipeableSidebar';
import SettingsContext from '../contexts/SettingsContext';
import Toast from './notifications/Toast';
import LoginButton from './LoginButton';
import IncompleteRegistrationModal from './auth/IncompleteRegistrationModal';
import useWindowEvents from '../hooks/useWindowEvents';
import {
  AuthEvent,
  AuthFlow,
  ErrorEvent,
  getKratosError,
  getKratosFlow,
  KRATOS_ERROR,
} from '../lib/kratos';
import { useToastNotification } from '../hooks/useToastNotification';
import { StyledModal } from './modals/StyledModal';
import {
  SocialRegistrationForm,
  SocialRegistrationFormValues,
} from './auth/SocialRegistrationForm';
import useProfileForm from '../hooks/useProfileForm';

export interface MainLayoutProps extends HTMLAttributes<HTMLDivElement> {
  showOnlyLogo?: boolean;
  greeting?: boolean;
  mainPage?: boolean;
  additionalButtons?: ReactNode;
  activePage?: string;
  useNavButtonsNotLinks?: boolean;
  mobileTitle?: string;
  showDnd?: boolean;
  dndActive?: boolean;
  screenCentered?: boolean;
  customBanner?: ReactNode;
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

const mainLayoutClass = (sidebarExpanded: boolean) =>
  sidebarExpanded ? 'laptop:pl-60' : 'laptop:pl-11';

export default function MainLayout({
  children,
  showOnlyLogo,
  greeting,
  activePage,
  useNavButtonsNotLinks,
  mobileTitle,
  showDnd,
  dndActive,
  customBanner,
  additionalButtons,
  screenCentered = true,
  onLogoClick,
  onNavTabClick,
  enableSearch,
  onShowDndClick,
}: MainLayoutProps): ReactElement {
  const router = useRouter();
  const { displayToast } = useToastNotification();
  const [isIncompleteRegistration, setIsIncompleteRegistration] =
    useState(false);
  const { user, loadingUser, shouldShowLogin, logout, refetchBoot } =
    useContext(AuthContext);
  const { trackEvent } = useContext(AnalyticsContext);
  const { sidebarRendered } = useSidebarRendered();
  const { bannerData, setLastSeen } = usePromotionalBanner();
  const [openMobileSidebar, setOpenMobileSidebar] = useState(false);
  const { sidebarExpanded, optOutWeeklyGoal, autoDismissNotifications } =
    useContext(SettingsContext);
  const { updateUserProfile, hint, onUpdateHint } = useProfileForm({
    onSuccess: () => refetchBoot(),
  });
  const handlers = useSwipeableSidebar({
    sidebarRendered,
    openMobileSidebar,
    setOpenMobileSidebar,
  });
  const displayErrorMessage = (text: string) => {
    displayToast(text);
    window.history.replaceState(null, '', '/');
  };
  useQuery(
    [{ type: 'login', flow: router?.query.flow as string }],
    ({ queryKey: [{ flow }] }) => getKratosFlow(AuthFlow.Recovery, flow),
    {
      enabled: !!router?.query.recovery && !!router?.query.flow,
      onSuccess: (data) => {
        if ('error' in data) {
          displayErrorMessage(data.error.message);
          return;
        }

        if (!data?.ui?.messages?.length) {
          return;
        }

        const error =
          data.ui.messages.find(
            (message) => message.id === KRATOS_ERROR.INVALID_TOKEN,
          ) || data.ui.messages[0];
        displayErrorMessage(error.text);
      },
    },
  );

  const onUpdateProfile = ({ name, username }: SocialRegistrationFormValues) =>
    updateUserProfile({ name, username });

  const trackAndToggleMobileSidebar = (state: boolean) => {
    trackEvent({
      event_name: `${state ? 'open' : 'close'} sidebar`,
    });
    setOpenMobileSidebar(state);
  };

  useEffect(() => {
    if (!user || user?.timezone || !user.infoConfirmed) {
      return;
    }

    setIsIncompleteRegistration(true);
  }, [user]);

  const hasBanner = !!bannerData?.banner || !!customBanner;

  useWindowEvents<ErrorEvent>('message', AuthEvent.Error, async (e) => {
    if (!e.data?.id) {
      return;
    }

    const res = await getKratosError(e.data.id);

    if (!res?.error) {
      return;
    }

    displayToast(res.error.message);
  });

  return (
    <div {...handlers}>
      {customBanner || (
        <PromotionalBanner bannerData={bannerData} setLastSeen={setLastSeen} />
      )}
      <Toast autoDismissNotifications={autoDismissNotifications} />
      <header
        className={classNames(
          'flex relative laptop:fixed laptop:left-0 z-3 flex-row laptop:flex-row justify-between items-center py-3 px-4 tablet:px-8 laptop:px-4 laptop:w-full h-14 border-b bg-theme-bg-primary border-theme-divider-tertiary',
          hasBanner ? 'laptop:top-8' : 'laptop:top-0',
        )}
      >
        {sidebarRendered !== undefined && (
          <>
            <Button
              className="block laptop:hidden btn-tertiary"
              iconOnly
              onClick={() => trackAndToggleMobileSidebar(true)}
              icon={<MenuIcon secondary />}
            />
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
            {additionalButtons}
            {!showOnlyLogo && !loadingUser && (
              <>
                {user ? (
                  <ProfileButton className="hidden laptop:flex" />
                ) : (
                  <LoginButton className="hidden laptop:block" />
                )}
              </>
            )}
            {!sidebarRendered && !optOutWeeklyGoal && (
              <MobileHeaderRankProgress />
            )}
          </>
        )}
      </header>
      <main
        className={classNames(
          'flex flex-row',
          !showOnlyLogo && !screenCentered && mainLayoutClass(sidebarExpanded),
          hasBanner ? 'laptop:pt-22' : 'laptop:pt-14',
        )}
      >
        {!showOnlyLogo && sidebarRendered !== null && (
          <Sidebar
            promotionalBannerActive={hasBanner}
            sidebarRendered={sidebarRendered}
            openMobileSidebar={openMobileSidebar}
            onNavTabClick={onNavTabClick}
            enableSearch={enableSearch}
            activePage={activePage}
            showDnd={showDnd}
            dndActive={dndActive}
            useNavButtonsNotLinks={useNavButtonsNotLinks}
            onShowDndClick={onShowDndClick}
            setOpenMobileSidebar={() => trackAndToggleMobileSidebar(false)}
          />
        )}
        {children}
      </main>
      {!shouldShowLogin && isIncompleteRegistration && user && (
        <IncompleteRegistrationModal
          isOpen={isIncompleteRegistration}
          onRequestClose={() => setIsIncompleteRegistration(false)}
        />
      )}
      {!shouldShowLogin && user && !user.infoConfirmed && (
        <StyledModal isOpen onRequestClose={() => logout()}>
          <SocialRegistrationForm
            className="mb-6"
            title="Complete your profile information"
            onSignup={onUpdateProfile}
            hints={hint}
            onUpdateHints={onUpdateHint}
          />
        </StyledModal>
      )}
    </div>
  );
}
