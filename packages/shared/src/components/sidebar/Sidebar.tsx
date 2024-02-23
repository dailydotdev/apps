import React, { ReactElement, useContext, useMemo, useState } from 'react';
import classNames from 'classnames';
import dynamic from 'next/dynamic';
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
  SquadSection,
  DiscoverSection,
  ContributeSection,
  MobileMenuIcon,
  SidebarUserButton,
  MyFeedButton,
  SidebarBottomSection,
  ManageSection,
} from './index';
import { getFeedName } from '../../lib/feed';

const UserSettingsModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "userSettingsModal" */ '../modals/UserSettingsModal'
    ),
);

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
}: SidebarProps): ReactElement {
  const { user, isLoggedIn } = useContext(AuthContext);
  const { alerts } = useContext(AlertContext);
  const {
    toggleSidebarExpanded,
    sidebarExpanded,
    loadedSettings,
    optOutWeeklyGoal,
  } = useContext(SettingsContext);
  const [showSettings, setShowSettings] = useState(false);

  const feedName = getFeedName(activePageProp, {
    hasUser: !!user,
    hasFiltered: !alerts?.filter,
  });
  const activePage = `/${feedName}`;

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

  return (
    <>
      {openMobileSidebar && sidebarRendered === false && (
        <SidebarBackdrop onClick={setOpenMobileSidebar} />
      )}
      <SidebarAside
        data-testid="sidebar-aside"
        className={classNames(
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
              onShowSettings={setShowSettings}
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
      {showSettings && (
        <UserSettingsModal
          isOpen={showSettings}
          onRequestClose={() => setShowSettings(false)}
        />
      )}
    </>
  );
}
