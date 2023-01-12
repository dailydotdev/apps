import React, {
  ReactElement,
  useContext,
  useMemo,
  useRef,
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
import { SidebarBottomSectionSection } from './SidebarBottomSection';
import { DiscoverSection } from './DiscoverSection';
import { ContributeSection } from './ContributeSection';
import { ManageSection } from './ManageSection';
import { MobileMenuIcon } from './MobileMenuIcon';
import FeaturesContext from '../../contexts/FeaturesContext';
import AuthContext from '../../contexts/AuthContext';
import { getFeedName } from '../MainFeedLayout';
import { SquadsList } from './SquadsList';
import { Button } from '../buttons/Button';
import PlusIcon from '../icons/Plus';
import { ProfilePicture } from '../ProfilePicture';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
import { Squad } from '../../graphql/squads';

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
  const { openModal } = useLazyModal();
  const [showSettings, setShowSettings] = useState(false);
  const {
    hasSquadAccess,
    canSubmitArticle,
    submitArticleSidebarButton,
    submitArticleModalButton,
    popularFeedCopy,
  } = useContext(FeaturesContext);
  const newSquadButtonVisible =
    sidebarRendered && hasSquadAccess && !squads?.length;
  const feedName = getFeedName(activePageProp, {
    hasUser: !!user,
    hasFiltered: !alerts?.filter,
  });
  const activePage = `/${feedName}`;

  useHideMobileSidebar({
    state: openMobileSidebar,
    action: setOpenMobileSidebar,
  });

  const previousRef = useRef(null);

  const openNewSquadModal = () =>
    openModal({
      type: LazyModal.NewSquad,
      props: {
        onPreviousState: () => previousRef.current(),
      },
    });
  const openSquadBetaModal = () =>
    openModal({
      type: LazyModal.BetaSquad,
      props: {
        onNext: openNewSquadModal,
      },
    });
  previousRef.current = openSquadBetaModal;

  const openLockedSquadModal = (squad: Squad) => {
    openModal({
      type: LazyModal.LockedSquad,
      props: {
        squad,
      },
    });
  };

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
              <div className="flex">
                <Button
                  buttonSize="small"
                  icon={<PlusIcon />}
                  iconOnly={!sidebarExpanded}
                  className={classNames(
                    'mt-0 laptop:mt-2 mb-4 btn-primary-cabbage flex flex-1',
                    sidebarExpanded ? 'mx-3' : 'mx-1.5',
                  )}
                  textPosition={
                    sidebarExpanded ? 'justify-start' : 'justify-center'
                  }
                  onClick={openSquadBetaModal}
                >
                  {sidebarExpanded && 'New squad'}
                </Button>
              </div>
            )}
            {!alerts?.filter && (
              <MyFeedButton
                sidebarRendered={sidebarRendered}
                sidebarExpanded={sidebarExpanded}
                activePage={activePage}
                isButton={isNavButtons}
                alerts={alerts}
                onNavTabClick={onNavTabClick}
                icon={<ProfilePicture size="xsmall" user={user} />}
              />
            )}
            {!!squads?.length && (
              <SquadsList
                activePage={activePageProp}
                squads={squads}
                onNewSquad={openSquadBetaModal}
                onOpenLockedSquad={openLockedSquadModal}
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
