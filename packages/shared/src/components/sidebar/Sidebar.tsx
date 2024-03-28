import React, { ReactElement, useContext, useMemo } from 'react';
import classNames from 'classnames';
import Link from 'next/link';
import { useRouter } from 'next/router';
import SettingsContext from '../../contexts/SettingsContext';
import {
  Nav,
  SidebarAside,
  SidebarBackdrop,
  SidebarProps,
  SidebarScrollWrapper,
} from './common';
import AlertContext from '../../contexts/AlertContext';
import useHideMobileSidebar from '../../hooks/useHideMobileSidebar';
import AuthContext from '../../contexts/AuthContext';
import { ProfilePicture } from '../ProfilePicture';
import {
  ContributeSection,
  DiscoverSection,
  ManageSection,
  MobileMenuIcon,
  MyFeedButton,
  SidebarBottomSection,
  SidebarUserButton,
  SquadSection,
} from './index';
import { getFeedName } from '../../lib/feed';
import { LazyModal } from '../modals/common/types';
import { useLazyModal } from '../../hooks/useLazyModal';
import { useMobileUxExperiment } from '../../hooks/useMobileUxExperiment';
import Logo, { LogoPosition } from '../Logo';
import { useViewSize, ViewSize } from '../../hooks';
import {
  Button,
  ButtonIconPosition,
  ButtonProps,
  ButtonSize,
  ButtonVariant,
} from '../buttons/Button';
import { AiIcon, HomeIcon, SourceIcon, UserIcon } from '../icons';
import { IconSize } from '../Icon';
import { CreatePostButton } from '../post/write';
import { SharedFeedPage } from '../utilities';
import { OtherFeedPage } from '../../lib/query';

export default function Sidebar({
  promotionalBannerActive = false,
  isNavButtons = false,
  activePage: activePageProp,
  sidebarRendered = false,
  openMobileSidebar = false,
  showDnd = false,
  dndActive = false,
  onNavTabClick,
  enableSearch,
  setOpenMobileSidebar,
  onShowDndClick,
  onLogoClick,
}: SidebarProps): ReactElement {
  const router = useRouter();
  const { user, isLoggedIn } = useContext(AuthContext);
  const { alerts } = useContext(AlertContext);
  const {
    toggleSidebarExpanded,
    sidebarExpanded,
    loadedSettings,
    optOutWeeklyGoal,
  } = useContext(SettingsContext);
  const { modal, openModal } = useLazyModal();
  const showSettings = modal?.type === LazyModal.UserSettings;
  const { isNewMobileLayout } = useMobileUxExperiment();
  const isTablet = useViewSize(ViewSize.Tablet);

  const feedName = getFeedName(activePageProp, {
    hasUser: !!user,
    hasFiltered: !alerts?.filter,
  });
  const activePage = `/${feedName}`;
  const isProfilePage = router.pathname?.includes('/[userId]');
  const isHomeActive = useMemo(() => {
    return [
      SharedFeedPage.MyFeed,
      SharedFeedPage.Popular,
      SharedFeedPage.Upvoted,
      SharedFeedPage.Discussed,
      OtherFeedPage.Bookmarks,
      OtherFeedPage.History,
      OtherFeedPage.Notifications,
    ].includes(feedName);
  }, [feedName]);

  useHideMobileSidebar({
    state: openMobileSidebar,
    action: setOpenMobileSidebar,
  });

  const defaultRenderSectionProps = useMemo(
    () => ({
      sidebarExpanded,
      sidebarRendered,
      shouldShowLabel: sidebarExpanded || sidebarRendered === false,
      activePage,
    }),
    [sidebarExpanded, sidebarRendered, activePage],
  );

  if (!loadedSettings) {
    return <></>;
  }

  if (isNewMobileLayout && isTablet) {
    const buttonProps: ButtonProps<'a' | 'button'> = {
      variant: ButtonVariant.Tertiary,
      size: ButtonSize.Large,
      className:
        'w-full !bg-transparent active:bg-transparent aria-pressed:bg-transparent',
    };

    return (
      <SidebarAside
        data-testid="sidebar-aside"
        className="w-16 items-center gap-4"
      >
        <Logo
          compact
          position={LogoPosition.Relative}
          onLogoClick={onLogoClick}
          className={classNames('h-10 pt-4')}
        />

        <Link href="/" prefetch={false} passHref>
          <Button
            {...buttonProps}
            tag="a"
            icon={<HomeIcon secondary={isHomeActive} size={IconSize.Medium} />}
            iconPosition={ButtonIconPosition.Top}
            variant={ButtonVariant.Option}
            pressed={isHomeActive}
          >
            Home
          </Button>
        </Link>

        <Link href="/search" prefetch={false} passHref>
          <Button
            {...buttonProps}
            tag="a"
            icon={
              <AiIcon
                secondary={feedName === SharedFeedPage.Search}
                size={IconSize.Medium}
              />
            }
            iconPosition={ButtonIconPosition.Top}
            variant={ButtonVariant.Option}
            pressed={feedName === SharedFeedPage.Search}
          >
            Search
          </Button>
        </Link>

        <Link href="/squads" prefetch={false} passHref>
          <Button
            {...buttonProps}
            tag="a"
            icon={
              <SourceIcon
                secondary={feedName === OtherFeedPage.Squad}
                size={IconSize.Medium}
              />
            }
            iconPosition={ButtonIconPosition.Top}
            variant={ButtonVariant.Option}
            pressed={feedName === OtherFeedPage.Squad}
          >
            Squads
          </Button>
        </Link>

        <Link href={user.permalink} prefetch={false} passHref>
          <Button
            {...buttonProps}
            tag="a"
            icon={<UserIcon secondary={isProfilePage} size={IconSize.Medium} />}
            iconPosition={ButtonIconPosition.Top}
            variant={ButtonVariant.Option}
            pressed={isProfilePage}
          >
            Profile
          </Button>
        </Link>

        <CreatePostButton compact sidebar />
      </SidebarAside>
    );
  }

  return (
    <>
      {openMobileSidebar && sidebarRendered === false && (
        <SidebarBackdrop onClick={setOpenMobileSidebar} />
      )}
      <SidebarAside
        data-testid="sidebar-aside"
        className={classNames(
          'w-70',
          sidebarExpanded ? 'laptop:w-60' : 'laptop:w-11',
          openMobileSidebar ? '-translate-x-0' : '-translate-x-70',
          promotionalBannerActive
            ? 'laptop:top-24 laptop:h-[calc(100vh-theme(space.24))]'
            : 'laptop:top-16 laptop:h-[calc(100vh-theme(space.16))]',
        )}
      >
        {sidebarRendered && (
          <MobileMenuIcon
            sidebarExpanded={sidebarExpanded}
            toggleSidebarExpanded={toggleSidebarExpanded}
          />
        )}
        <SidebarScrollWrapper>
          <Nav>
            <SidebarUserButton sidebarRendered={sidebarRendered} />
            {isLoggedIn && (
              <MyFeedButton
                {...defaultRenderSectionProps}
                isButton={isNavButtons}
                alerts={alerts}
                onNavTabClick={onNavTabClick}
                icon={<ProfilePicture size="xsmall" user={user} />}
              />
            )}
            <SquadSection {...defaultRenderSectionProps} />
            <DiscoverSection
              {...defaultRenderSectionProps}
              onNavTabClick={onNavTabClick}
              enableSearch={enableSearch}
              isItemsButton={isNavButtons}
            />
            <ContributeSection {...defaultRenderSectionProps} />
            <ManageSection
              {...defaultRenderSectionProps}
              isDndActive={dndActive}
              showDnd={showDnd}
              onShowDndClick={onShowDndClick}
              showSettings={showSettings}
              onShowSettings={() => openModal({ type: LazyModal.UserSettings })}
            />
          </Nav>
          <div className="flex-1" />
          <SidebarBottomSection
            {...defaultRenderSectionProps}
            optOutWeeklyGoal={optOutWeeklyGoal}
            showSettings={showSettings}
          />
        </SidebarScrollWrapper>
      </SidebarAside>
    </>
  );
}
