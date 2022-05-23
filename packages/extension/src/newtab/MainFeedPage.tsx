import React, {
  ReactElement,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import classNames from 'classnames';
import MainLayout from '@dailydotdev/shared/src/components/MainLayout';
import MainFeedLayout, {
  getShouldRedirect,
} from '@dailydotdev/shared/src/components/MainFeedLayout';
import FeedLayout from '@dailydotdev/shared/src/components/FeedLayout';
import dynamic from 'next/dynamic';
import CompanionFilledIcon from '@dailydotdev/shared/icons/filled/companion.svg';
import CompanionOutlineIcon from '@dailydotdev/shared/icons/outline/companion.svg';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import useDefaultFeed from '@dailydotdev/shared/src/hooks/useDefaultFeed';
import SimpleTooltip from '@dailydotdev/shared/src/components/tooltips/SimpleTooltip';
import { useMyFeed } from '@dailydotdev/shared/src/hooks/useMyFeed';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import FeaturesContext from '@dailydotdev/shared/src/contexts/FeaturesContext';
import {
  Features,
  getFeatureValue,
} from '@dailydotdev/shared/src/lib/featureManagement';
import ShortcutLinks from './ShortcutLinks';
import DndBanner from './DndBanner';
import DndContext from './DndContext';
import { useExtensionPermission } from '../companion/useExtensionPermission';
import { CompanionPermission } from '../companion/CompanionPermission';

const PostsSearch = dynamic(
  () =>
    import(
      /* webpackChunkName: "search" */ '@dailydotdev/shared/src/components/PostsSearch'
    ),
);

const DndModal = dynamic(
  () => import(/* webpackChunkName: "dnd" */ './DndModal'),
);

export type MainFeedPageProps = {
  onPageChanged: (page: string) => unknown;
};

export default function MainFeedPage({
  onPageChanged,
}: MainFeedPageProps): ReactElement {
  const { user, loadedUserFromCache } = useContext(AuthContext);
  const [feedName, setFeedName] = useState<string>('default');
  const [isSearchOn, setIsSearchOn] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>();
  const [showCompanionPermission, setShowCompanionPermission] = useState(false);
  const [showDnd, setShowDnd] = useState(false);
  const CompanionIcon = showCompanionPermission
    ? CompanionFilledIcon
    : CompanionOutlineIcon;
  const { registerLocalFilters, shouldShowMyFeed } = useMyFeed();
  const { contentScriptGranted } = useExtensionPermission();
  const [defaultFeed] = useDefaultFeed(shouldShowMyFeed);
  const { isActive: isDndActive } = useContext(DndContext);
  const enableSearch = () => {
    setIsSearchOn(true);
    setSearchQuery(null);
    onPageChanged('/search');
  };
  const { flags } = useContext(FeaturesContext);
  const placement = getFeatureValue(
    Features.CompanionPermissionPlacement,
    flags,
  );

  const onNavTabClick = (tab: string): void => {
    if (tab !== 'search') {
      setIsSearchOn(false);
    }
    setFeedName(tab);
    const isMyFeed = tab === '/my-feed';
    if (getShouldRedirect(isMyFeed, !!user)) {
      onPageChanged(`/`);
    } else {
      onPageChanged(`/${tab}`);
    }
  };

  const activePage = useMemo(() => {
    if (isSearchOn) {
      return '/search';
    }
    return `/${feedName === 'default' ? defaultFeed : feedName}`;
  }, [isSearchOn, feedName, defaultFeed]);

  const onLogoClick = (e: React.MouseEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    setFeedName('popular');
    setIsSearchOn(false);
    setSearchQuery(undefined);
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const createFilter = urlParams.get('create_filters');

    if (createFilter) {
      registerLocalFilters().then(({ hasFilters }) => {
        if (hasFilters) {
          setFeedName('my-feed');
        }
      });
    }
  }, []);

  useEffect(() => {
    if (!loadedUserFromCache) {
      return;
    }

    setShowCompanionPermission(!!user);
  }, [user, loadedUserFromCache]);

  return (
    <MainLayout
      greeting
      mainPage
      useNavButtonsNotLinks
      activePage={activePage}
      onLogoClick={onLogoClick}
      showDnd={showDnd}
      onShowDndClick={() => setShowDnd(true)}
      enableSearch={enableSearch}
      onNavTabClick={onNavTabClick}
      screenCentered={false}
      customBanner={isDndActive && <DndBanner />}
      additionalButtons={
        placement === 'header' &&
        !contentScriptGranted && (
          <SimpleTooltip
            content={<CompanionPermission />}
            placement="bottom-start"
            offset={[-140, 12]}
            container={{
              paddingClassName: 'px-6 py-4',
              bgClassName: 'bg-theme-bg-primary',
              textClassName: 'text-theme-label-primary typo-callout',
              className:
                'border border-theme-status-cabbage w-[30.75rem] whitespace-pre-wrap shadow-2',
              arrow: false,
            }}
            interactive
            visible={showCompanionPermission}
          >
            <Button
              onClick={() =>
                setShowCompanionPermission(!showCompanionPermission)
              }
              className={classNames(
                'mr-4 border-theme-status-cabbage',
                showCompanionPermission
                  ? 'btn-primary-cabbage'
                  : 'btn-secondary-cabbage',
              )}
              icon={
                <CompanionIcon
                  className={
                    showCompanionPermission
                      ? 'w-7 h-7 text-theme-label-primary'
                      : 'w-6 h-6 text-theme-status-cabbage'
                  }
                />
              }
            />
          </SimpleTooltip>
        )
      }
    >
      <FeedLayout>
        <MainFeedLayout
          feedName={feedName}
          isSearchOn={isSearchOn}
          searchQuery={searchQuery}
          searchChildren={
            <PostsSearch
              onSubmitQuery={async (query) => setSearchQuery(query)}
            />
          }
          navChildren={!isSearchOn && <ShortcutLinks />}
        />
      </FeedLayout>
      <DndModal isOpen={showDnd} onRequestClose={() => setShowDnd(false)} />
    </MainLayout>
  );
}
