import React, {
  ReactElement,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import classNames from 'classnames';
import dynamic from 'next/dynamic';
import { sticky } from 'tippy.js';
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
import { SidebarBottomSectionSection } from './SidebarBottomSection';
import { DiscoverSection } from './DiscoverSection';
import { ContributeSection } from './ContributeSection';
import { ManageSection } from './ManageSection';
import { MobileMenuIcon } from './MobileMenuIcon';
import FeaturesContext from '../../contexts/FeaturesContext';
import AuthContext from '../../contexts/AuthContext';
import { getFeedName } from '../MainFeedLayout';
import { SquadsList } from './SquadsList';
import { Button, ButtonSize } from '../buttons/Button';
import PlusIcon from '../icons/Plus';
import { ProfilePicture } from '../ProfilePicture';
import { useCreateSquadModal } from '../../hooks/useCreateSquadModal';
import { Origin } from '../../lib/analytics';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import { TutorialKey, useTutorial } from '../../hooks/useTutorial';
import useDebounce from '../../hooks/useDebounce';

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
  const { user, squads } = useContext(AuthContext);
  const { alerts } = useContext(AlertContext);
  const {
    toggleSidebarExpanded,
    sidebarExpanded,
    loadedSettings,
    optOutWeeklyGoal,
  } = useContext(SettingsContext);
  const [showSettings, setShowSettings] = useState(false);
  const {
    hasSquadAccess,
    canSubmitArticle,
    submitArticleSidebarButton,
    submitArticleModalButton,
    popularFeedCopy,
    isFlagsFetched,
  } = useContext(FeaturesContext);
  const { openNewSquadModal } = useCreateSquadModal({
    hasSquads: !!squads?.length,
    hasAccess: hasSquadAccess,
    isFlagsFetched,
  });
  const newSquadButtonVisible =
    sidebarRendered && hasSquadAccess && !squads?.length;
  const newSquadTooltipOffset: [number, number] = sidebarExpanded
    ? [0, 1.5 * 16]
    : [0, 1 * 16];
  const newSquadTooltipTutorial = useTutorial({
    key: TutorialKey.SeenNewSquadTooltip,
  });

  const [completeTutorialWithDelay] = useDebounce(() => {
    newSquadTooltipTutorial.complete();
  }, 4 * 1000);

  useEffect(() => {
    if (!newSquadTooltipTutorial.isActive) {
      return;
    }

    completeTutorialWithDelay();
  }, [newSquadTooltipTutorial.isActive]);

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
            {newSquadButtonVisible && (
              <div className="flex mt-0 laptop:mt-2 mb-4">
                <SimpleTooltip
                  content={
                    <>
                      You can always
                      <br /> open a squad here
                    </>
                  }
                  placement="right"
                  offset={newSquadTooltipOffset}
                  sticky
                  plugins={[sticky]}
                  visible={newSquadTooltipTutorial.isActive}
                >
                  <Button
                    buttonSize={ButtonSize.Small}
                    icon={<PlusIcon />}
                    iconOnly={!sidebarExpanded}
                    className={classNames(
                      'btn-primary-cabbage flex flex-1',
                      sidebarExpanded ? 'mx-3' : 'mx-1.5',
                    )}
                    textPosition={
                      sidebarExpanded ? 'justify-start' : 'justify-center'
                    }
                    onClick={() => {
                      if (newSquadTooltipTutorial.isActive) {
                        newSquadTooltipTutorial.complete();
                      }

                      openNewSquadModal({ origin: Origin.Sidebar });
                    }}
                  >
                    {sidebarExpanded && 'New Squad'}
                  </Button>
                </SimpleTooltip>
              </div>
            )}
            {!alerts?.filter && (
              <MyFeedButton
                {...defaultRenderSectionProps}
                isButton={isNavButtons}
                alerts={alerts}
                onNavTabClick={onNavTabClick}
                icon={<ProfilePicture size="xsmall" user={user} />}
              />
            )}
            {!!squads?.length && (
              <SquadsList
                {...defaultRenderSectionProps}
                activePage={activePageProp}
                squads={squads}
                onNewSquad={() => openNewSquadModal({ origin: Origin.Sidebar })}
              />
            )}
            <DiscoverSection
              {...defaultRenderSectionProps}
              popularFeedCopy={popularFeedCopy}
              onNavTabClick={onNavTabClick}
              enableSearch={enableSearch}
              isItemsButton={isNavButtons}
              className={!!squads?.length && '!mt-6'}
            />
            <ContributeSection
              {...defaultRenderSectionProps}
              canSubmitArticle={canSubmitArticle}
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
