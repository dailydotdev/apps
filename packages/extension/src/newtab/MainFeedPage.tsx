import React, {
  ReactElement,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
} from 'react';
import MainLayout from '@dailydotdev/shared/src/components/MainLayout';
import MainFeedLayout, {
  getShouldRedirect,
} from '@dailydotdev/shared/src/components/MainFeedLayout';
import FeedLayout from '@dailydotdev/shared/src/components/FeedLayout';
import dynamic from 'next/dynamic';

import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import useDefaultFeed from '@dailydotdev/shared/src/hooks/useDefaultFeed';
import { useMyFeed } from '@dailydotdev/shared/src/hooks/useMyFeed';
import FeaturesContext from '@dailydotdev/shared/src/contexts/FeaturesContext';
import {
  Features,
  getFeatureValue,
} from '@dailydotdev/shared/src/lib/featureManagement';
import SettingsContext from '@dailydotdev/shared/src/contexts/SettingsContext';
import ShortcutLinks from './ShortcutLinks';
import DndBanner from './DndBanner';
import DndContext from './DndContext';
import { CompanionPopupButton } from '../companion/CompanionPopupButton';
import { useExtensionPermission } from '../companion/useExtensionPermission';

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
  const { user } = useContext(AuthContext);
  const [feedName, setFeedName] = useState<string>('default');
  const [isSearchOn, setIsSearchOn] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>();
  const [showDnd, setShowDnd] = useState(false);
  const isOnLoad = useRef(true);
  const { contentScriptGranted, registerContentScripts } =
    useExtensionPermission();
  const { registerLocalFilters, shouldShowMyFeed } = useMyFeed();
  const [defaultFeed] = useDefaultFeed(shouldShowMyFeed);
  const { optOutCompanion, toggleOptOutCompanion, loadedSettings } =
    useContext(SettingsContext);
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
    if (
      placement === 'off' ||
      optOutCompanion ||
      contentScriptGranted ||
      !loadedSettings
    ) {
      return;
    }

    if (isOnLoad.current) {
      isOnLoad.current = false;
      return;
    }

    registerContentScripts().then((granted) => {
      if (!granted) {
        toggleOptOutCompanion();
      }
    });
  }, [placement, optOutCompanion, loadedSettings]);

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
      additionalButtons={placement === 'header' && <CompanionPopupButton />}
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
