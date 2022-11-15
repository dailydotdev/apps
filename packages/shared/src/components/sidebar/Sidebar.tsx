import React, {
  ReactElement,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
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
import SidebarUserButton from './SidebarUserButton';
import useHideMobileSidebar from '../../hooks/useHideMobileSidebar';
import MyFeedButton from './MyFeedButton';
import useDefaultFeed from '../../hooks/useDefaultFeed';
import { SidebarBottomSectionSection } from './SidebarBottomSection';
import { DiscoverSection } from './DiscoverSection';
import { ContributeSection } from './ContributeSection';
import { ManageSection } from './ManageSection';
import { MobileMenuIcon } from './MobileMenuIcon';
import FeaturesContext from '../../contexts/FeaturesContext';
import { SquadVersion } from '../../lib/featureValues';
import { SquadSection } from './SquadSection';
import SquadButton from './SquadButton';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import AuthContext from '../../contexts/AuthContext';

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
  const { user } = useContext(AuthContext);
  const { trackEvent } = useContext(AnalyticsContext);
  const { alerts } = useContext(AlertContext);
  const defaultFeed = useDefaultFeed({
    feed: activePageProp,
    hasUser: !!user,
    hasFiltered: !alerts?.filter,
  });
  const {
    toggleSidebarExpanded,
    sidebarExpanded,
    loadedSettings,
    optOutWeeklyGoal,
  } = useContext(SettingsContext);
  const [showSettings, setShowSettings] = useState(false);
  const {
    canSubmitArticle,
    submitArticleOn,
    submitArticleSidebarButton,
    submitArticleModalButton,
    popularFeedCopy,
    squadVersion,
    squadForm,
    squadButton,
  } = useContext(FeaturesContext);
  const squadVisible = sidebarRendered && user;
  const [trackedSquadImpression, setTrackedSquadImpression] = useState(false);
  const activePage =
    activePageProp === '/' ? `/${defaultFeed}` : activePageProp;

  useHideMobileSidebar({
    state: openMobileSidebar,
    action: setOpenMobileSidebar,
  });

  const trackSquadClicks = () => {
    trackEvent({
      event_name: 'click create squad',
      target_id: squadVersion,
      feed_item_title: squadButton,
      feed_item_target_url: squadForm,
    });
  };

  const defaultSquadButtonProps = useMemo(
    () => ({
      squadForm: `${squadForm}#user_id=${user?.id}`,
      squadButton,
      squadVersion,
      onSquadClick: trackSquadClicks,
    }),
    [squadForm, squadButton, squadVersion, user],
  );

  const defaultRenderSectionProps = useMemo(
    () => ({
      sidebarExpanded,
      sidebarRendered,
      activePage,
    }),
    [sidebarExpanded, sidebarRendered, activePage],
  );

  useEffect(() => {
    if (trackedSquadImpression) {
      return;
    }
    if (squadVersion !== SquadVersion.Off && squadVisible) {
      trackEvent({
        event_name: 'impression',
        target_type: 'create squad',
        target_id: squadVersion,
        feed_item_title: squadButton,
        feed_item_target_url: squadForm,
      });
      setTrackedSquadImpression(true);
    }
  }, [
    squadVersion,
    squadButton,
    squadForm,
    squadVisible,
    trackedSquadImpression,
  ]);

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
        {sidebarRendered && (
          <MobileMenuIcon
            sidebarExpanded={sidebarExpanded}
            toggleSidebarExpanded={toggleSidebarExpanded}
          />
        )}
        <SidebarScrollWrapper>
          <Nav>
            <SidebarUserButton sidebarRendered={sidebarRendered} />
            {squadVersion === SquadVersion.V4 && squadVisible && (
              <SquadButton
                {...defaultRenderSectionProps}
                {...defaultSquadButtonProps}
              />
            )}
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
            {[SquadVersion.V1, SquadVersion.V2].includes(squadVersion) &&
              squadVisible && (
                <SquadButton
                  {...defaultRenderSectionProps}
                  {...defaultSquadButtonProps}
                />
              )}
            {squadVersion === SquadVersion.V3 && squadVisible && (
              <SquadSection
                {...defaultRenderSectionProps}
                {...defaultSquadButtonProps}
              />
            )}
            <DiscoverSection
              {...defaultRenderSectionProps}
              popularFeedCopy={popularFeedCopy}
              onNavTabClick={onNavTabClick}
              enableSearch={enableSearch}
              isItemsButton={isNavButtons}
            />
            <ContributeSection
              {...defaultRenderSectionProps}
              canSubmitArticle={canSubmitArticle}
              submitArticleOn={submitArticleOn}
              submitArticleSidebarButton={submitArticleSidebarButton}
              submitArticleModalButton={submitArticleModalButton}
            />
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
          <SidebarBottomSectionSection
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
