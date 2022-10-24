import React, { ReactElement, useContext, useState, useMemo } from 'react';
import classNames from 'classnames';
import dynamic from 'next/dynamic';
import SettingsContext from '../../contexts/SettingsContext';
import {
  Nav,
  SidebarAside,
  SidebarProps,
  SidebarBackdrop,
  SidebarScrollWrapper,
} from './common';
import AlertContext from '../../contexts/AlertContext';
import SidebarUserButton from './SidebarUserButton';
import useHideMobileSidebar from '../../hooks/useHideMobileSidebar';
import MyFeedButton from './MyFeedButton';
import useDefaultFeed from '../../hooks/useDefaultFeed';
import { UnlabeledBottomSection } from './UnlabeledBottomSection';
import { DiscoverSection } from './DiscoverSection';
import { ContributeSection } from './ContributeSection';
import { ManageSection } from './ManageSection';
import { MobileMenuIcon } from './MobileMenuIcon';

const UserSettingsModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "UserSettingsModal" */ '../modals/UserSettingsModal'
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
  const [defaultFeed] = useDefaultFeed();
  const { alerts } = useContext(AlertContext);
  const { sidebarExpanded, loadedSettings, optOutWeeklyGoal } =
    useContext(SettingsContext);
  const [showSettings, setShowSettings] = useState(false);
  const activePage =
    activePageProp === '/' ? `/${defaultFeed}` : activePageProp;

  useHideMobileSidebar({
    state: openMobileSidebar,
    action: setOpenMobileSidebar,
  });

  const defaultRenderSectionProps = useMemo(
    () => ({
      sidebarExpanded,
      sidebarRendered,
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
            ? 'laptop:top-22 laptop:h-[calc(100vh-theme(space.22))]'
            : 'laptop:top-14 laptop:h-[calc(100vh-theme(space.14))]',
        )}
      >
        {sidebarRendered && <MobileMenuIcon />}
        <SidebarScrollWrapper>
          <Nav>
            <SidebarUserButton sidebarRendered={sidebarRendered} />
            {!alerts?.filter && (
              <MyFeedButton
                sidebarRendered={sidebarRendered}
                sidebarExpanded={sidebarExpanded}
                activePage={activePage}
                isButton={isNavButtons}
                alerts={alerts}
                onNavTabClick={onNavTabClick}
              />
            )}
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
          <UnlabeledBottomSection
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
