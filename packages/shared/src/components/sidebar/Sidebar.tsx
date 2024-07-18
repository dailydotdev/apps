import React, { ReactElement, useContext, useMemo } from 'react';
import classNames from 'classnames';
import Link from 'next/link';
import { useRouter } from 'next/router';
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
import { ProfileImageSize, ProfilePicture } from '../ProfilePicture';
import {
  DiscoverSection,
  ActivitySection,
  MobileMenuIcon,
  MyFeedButton,
  SidebarBottomSection,
  SidebarUserButton,
  SquadSection,
} from './index';
import { getFeedName } from '../../lib/feed';
import { LazyModal } from '../modals/common/types';
import { useLazyModal } from '../../hooks/useLazyModal';
import Logo, { LogoPosition } from '../Logo';
import {
  useActions,
  useConditionalFeature,
  useFeeds,
  useViewSize,
  ViewSize,
} from '../../hooks';
import {
  Button,
  ButtonIconPosition,
  ButtonProps,
  ButtonSize,
  ButtonVariant,
} from '../buttons/Button';
import {
  AiIcon,
  HashtagIcon,
  HomeIcon,
  PlusIcon,
  SourceIcon,
  UserIcon,
} from '../icons';
import { IconSize } from '../Icon';
import { CreatePostButton } from '../post/write';
import useActiveNav from '../../hooks/useActiveNav';
import { useFeatureTheme } from '../../hooks/utils/useFeatureTheme';
import { webappUrl } from '../../lib/constants';
import { AlertColor, AlertDot } from '../AlertDot';
import { cloudinary } from '../../lib/image';
import { ActionType } from '../../graphql/actions';
import { feature } from '../../lib/featureManagement';

const SidebarOnboardingChecklistCard = dynamic(
  () =>
    import(
      /* webpackChunkName: "sidebarOnboardingChecklistCard" */ '../checklist/SidebarOnboardingChecklistCard'
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
  onLogoClick,
}: SidebarProps): ReactElement {
  const router = useRouter();
  const { user, isLoggedIn } = useContext(AuthContext);
  const { alerts } = useContext(AlertContext);
  const { toggleSidebarExpanded, sidebarExpanded, loadedSettings } =
    useContext(SettingsContext);
  const { modal, openModal } = useLazyModal();
  const showSettings = modal?.type === LazyModal.UserSettings;
  const isLaptop = useViewSize(ViewSize.Laptop);
  const isTablet = useViewSize(ViewSize.Tablet);
  const featureTheme = useFeatureTheme();
  const { checkHasCompleted, isActionsFetched } = useActions();
  const { value: mobileExploreTab } = useConditionalFeature({
    feature: feature.mobileExploreTab,
    shouldEvaluate: !isLaptop,
  });
  const feedName = getFeedName(activePageProp, {
    hasUser: !!user,
    hasFiltered: !alerts?.filter,
  });

  const activeNav = useActiveNav(feedName);
  const activePage = router.asPath || router.pathname;

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

  const { feeds } = useFeeds();

  if (!loadedSettings) {
    return <></>;
  }

  if (!isLaptop && isTablet) {
    const buttonProps: ButtonProps<'a' | 'button'> = {
      variant: ButtonVariant.Tertiary,
      size: ButtonSize.Large,
      className:
        'w-full !bg-transparent active:bg-transparent aria-pressed:bg-transparent typo-caption1',
    };

    return (
      <SidebarAside
        data-testid="sidebar-aside"
        className={classNames(
          'w-16 items-center gap-4',
          featureTheme && 'bg-transparent',
        )}
      >
        <Logo
          compact
          position={LogoPosition.Relative}
          onLogoClick={onLogoClick}
          className={classNames('h-10 pt-4')}
          featureTheme={featureTheme}
        />
        <Link href={`${webappUrl}`} prefetch={false} passHref>
          <Button
            {...buttonProps}
            tag="a"
            icon={
              <HomeIcon secondary={activeNav.home} size={IconSize.Medium} />
            }
            iconPosition={ButtonIconPosition.Top}
            variant={ButtonVariant.Option}
            pressed={activeNav.home}
          >
            Home
          </Button>
        </Link>

        <Link
          href={mobileExploreTab ? `${webappUrl}posts` : `${webappUrl}search`}
          prefetch={false}
          passHref
        >
          <Button
            {...buttonProps}
            tag="a"
            icon={
              <AiIcon secondary={activeNav.search} size={IconSize.Medium} />
            }
            iconPosition={ButtonIconPosition.Top}
            variant={ButtonVariant.Option}
            pressed={activeNav.search}
          >
            {mobileExploreTab ? 'Explore' : 'Search'}
          </Button>
        </Link>

        <Link href={`${webappUrl}squads`} prefetch={false} passHref>
          <Button
            {...buttonProps}
            tag="a"
            icon={
              <SourceIcon secondary={activeNav.squads} size={IconSize.Medium} />
            }
            iconPosition={ButtonIconPosition.Top}
            variant={ButtonVariant.Option}
            pressed={activeNav.squads}
          >
            Squads
          </Button>
        </Link>

        {isLoggedIn && (
          <Link href={user.permalink} prefetch={false} passHref>
            <Button
              {...buttonProps}
              tag="a"
              icon={
                <UserIcon
                  secondary={activeNav.profile}
                  size={IconSize.Medium}
                />
              }
              iconPosition={ButtonIconPosition.Top}
              variant={ButtonVariant.Option}
              pressed={activeNav.profile}
            >
              Profile
            </Button>
          </Link>
        )}

        <CreatePostButton compact sidebar />
      </SidebarAside>
    );
  }

  const showCustomFeedsBetaBadge =
    isActionsFetched && !checkHasCompleted(ActionType.CustomFeed);

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
          featureTheme && 'bg-transparent',
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
                title="My feed"
                path="/"
                alert={
                  (alerts.filter || alerts.myFeed) &&
                  !sidebarExpanded && (
                    <AlertDot
                      className="right-2.5 top-0"
                      color={AlertColor.Success}
                    />
                  )
                }
                onNavTabClick={onNavTabClick}
                icon={
                  <ProfilePicture size={ProfileImageSize.XSmall} user={user} />
                }
              />
            )}
            {feeds?.edges?.map((feed) => {
              const feedPath = `${webappUrl}feeds/${feed.node.id}`;

              return (
                <MyFeedButton
                  {...defaultRenderSectionProps}
                  key={feed.node.id}
                  isButton={false}
                  title={feed.node.flags.name || `Feed ${feed.node.id}`}
                  path={feedPath}
                  icon={
                    <HashtagIcon
                      secondary={
                        defaultRenderSectionProps.activePage === feedPath
                      }
                    />
                  }
                />
              );
            })}
            <MyFeedButton
              {...defaultRenderSectionProps}
              isButton={false}
              title="New feed"
              path={`${webappUrl}feeds/new`}
              icon={
                <div className="rounded-6 bg-background-subtle">
                  <PlusIcon />
                </div>
              }
              rightIcon={() =>
                showCustomFeedsBetaBadge ? (
                  <div className="absolute -right-3 -top-2 h-4 w-10">
                    <img src={cloudinary.feed.betaTag} alt="Beta" />
                  </div>
                ) : undefined
              }
            />
            <SquadSection {...defaultRenderSectionProps} />
            <DiscoverSection
              {...defaultRenderSectionProps}
              onNavTabClick={onNavTabClick}
              enableSearch={enableSearch}
              isItemsButton={isNavButtons}
            />
            <ActivitySection
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
            showSettings={showSettings}
          />
          {isLoggedIn && sidebarExpanded && <SidebarOnboardingChecklistCard />}
        </SidebarScrollWrapper>
      </SidebarAside>
    </>
  );
}
