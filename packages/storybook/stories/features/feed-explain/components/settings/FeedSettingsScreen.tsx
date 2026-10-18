import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { FeedSettingsEditContext } from '@dailydotdev/shared/src/components/feeds/FeedSettings/FeedSettingsEditContext';
import { FeedSettingsContentPreferencesSection } from '@dailydotdev/shared/src/components/feeds/FeedSettings/sections/FeedSettingsContentPreferencesSection';
import { FeedSettingsBlockingSection } from '@dailydotdev/shared/src/components/feeds/FeedSettings/sections/FeedSettingsBlockingSection';
import { FeedSettingsAISection } from '@dailydotdev/shared/src/components/feeds/FeedSettings/sections/FeedSettingsAISection';
import { FeedSettingsGeneralSection } from '@dailydotdev/shared/src/components/feeds/FeedSettings/sections/FeedSettingsGeneralSection';
import { ShellPageProvider } from '@dailydotdev/shared/src/components/shell/ShellPageContext';
import { ShellBlock } from '@dailydotdev/shared/src/components/shell/ShellBlock';
import {
  useViewSize,
  ViewSize,
} from '@dailydotdev/shared/src/hooks/useViewSize';
import { useQueryState } from '@dailydotdev/shared/src/hooks/utils/useQueryState';
import {
  generateQueryKey,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import { clickbaitTriesMax } from '@dailydotdev/shared/src/lib/featureManagement';
import { FeatureOverrides } from '../../../../../mock/GrowthBookProvider';
import { AccountPageContainer } from '../../../../../../webapp/components/layouts/SettingsLayout/AccountPageContainer';
import { navigationKey } from '../../../../../../webapp/components/layouts/SettingsLayout';
import { usePersonalization } from '../PersonalizationContext';
import { ChangesDock } from '../ChangesDock';
import { SourcesSection } from '../panel/SourcesSection';
import { RankingSection } from '../panel/RankingSection';
import { FeedSettingsPage, getPageTitle, plural } from './pages';
import { SettingsMenuDesktop, SettingsMenuMobile } from './SettingsMenu';
import { OverviewPage } from './OverviewPage';
import { TopicsPage } from './TopicsPage';
import { BlockedNote } from './BlockedNote';
import { bindSettingsStore, useMainFeedEditContext } from './settingsMocks';

// Pages whose search field floats at the bottom on a phone, like the bar.
const phoneFieldPages = [FeedSettingsPage.Topics, FeedSettingsPage.Filters];

const PageSection = ({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}): ReactElement => (
  <section aria-labelledby={`${id}-title`} className="flex flex-col gap-4">
    <h2 id={`${id}-title`} className="font-bold text-text-primary typo-title3">
      {title}
    </h2>
    {children}
  </section>
);

const SourcesPage = ({
  onNavigate,
}: {
  onNavigate: (page: FeedSettingsPage) => void;
}): ReactElement => {
  const { state } = usePersonalization();
  const sources = state.blockedSources.length;
  const people = state.blockedAuthors.length;
  const blocked = [
    sources && plural(sources, 'source', 'sources'),
    people && plural(people, 'person', 'people'),
  ].filter(Boolean);

  return (
    <div className="flex flex-col gap-10">
      <SourcesSection />
      {blocked.length > 0 && (
        <BlockedNote
          text={`You blocked ${blocked.join(' and ')}. Their posts never show.`}
          onOpen={() => onNavigate(FeedSettingsPage.Filters)}
        />
      )}
    </div>
  );
};

/** Content preferences and Blocked content, as one page of what never shows. */
const FiltersPage = (): ReactElement => (
  <div className="flex flex-col gap-10">
    <PageSection id="filters-preferences" title="Content preferences">
      <FeedSettingsContentPreferencesSection />
    </PageSection>
    <PageSection id="filters-blocked" title="Blocked">
      <FeedSettingsBlockingSection />
    </PageSection>
  </div>
);

const PageContent = ({
  page,
  onNavigate,
}: {
  page: FeedSettingsPage;
  onNavigate: (page: FeedSettingsPage) => void;
}): ReactElement => {
  switch (page) {
    case FeedSettingsPage.Topics:
      return <TopicsPage onNavigate={onNavigate} />;
    case FeedSettingsPage.Sources:
      return <SourcesPage onNavigate={onNavigate} />;
    case FeedSettingsPage.Ranking:
      return <RankingSection />;
    case FeedSettingsPage.Filters:
      return <FiltersPage />;
    case FeedSettingsPage.AI:
      return (
        // The free Clickbait Shield tries count down from the flag's default.
        <FeatureOverrides
          values={{ [clickbaitTriesMax.id]: clickbaitTriesMax.defaultValue }}
        >
          <section className="flex flex-col gap-4">
            <FeedSettingsAISection />
          </section>
        </FeatureOverrides>
      );
    case FeedSettingsPage.General:
      return (
        <section className="flex flex-col gap-4">
          <FeedSettingsGeneralSection />
        </section>
      );
    default:
      return <OverviewPage onNavigate={onNavigate} />;
  }
};

/**
 * Settings with Feed settings rebuilt around personalization: the settings
 * menu, the page in the real page container, and the changes bar.
 */
export const FeedSettingsScreen = ({
  initialPage = FeedSettingsPage.Overview,
  initialMenuOpen,
  onBack,
}: {
  initialPage?: FeedSettingsPage;
  /** Opens on the phone's settings menu, the page behind every section. */
  initialMenuOpen?: boolean;
  /** Back to For You, from the bar or from the phone menu. */
  onBack: () => void;
}): ReactElement => {
  const store = usePersonalization();
  const { blockedTags, blockedSources, blockedAuthors } = store.state;
  const client = useQueryClient();
  const { user } = useAuthContext();
  const editContext = useMainFeedEditContext(user);
  const isMobile = useViewSize(ViewSize.MobileL);
  const [page, setPage] = useState(initialPage);
  const [isMenuOpen, setIsMenuOpen] = useQueryState({
    key: navigationKey,
    defaultValue: false,
  });

  useEffect(() => {
    bindSettingsStore(store);
  }, [store]);
  // A block or an Undo from anywhere shows in the Blocked lists.
  useEffect(() => {
    client.invalidateQueries({
      queryKey: generateQueryKey(
        RequestKey.ContentPreference,
        user,
        RequestKey.UserBlocked,
      ),
    });
  }, [client, user, blockedTags, blockedSources, blockedAuthors]);
  useEffect(() => {
    if (initialMenuOpen) {
      setIsMenuOpen(true);
    }
    return () => bindSettingsStore(undefined);
    // Only on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Like `SettingsLayout`, nothing renders before the signed-in user is known.
  if (!user) {
    return null;
  }

  const onNavigate = (next: FeedSettingsPage) => {
    setPage(next);
    setIsMenuOpen(false);
    window.scrollTo({ top: 0 });
  };

  return (
    <FeedSettingsEditContext.Provider value={editContext}>
      <ShellPageProvider>
        {isMobile && <ShellBlock />}
        {/* `MainLayout` keeps content under the phone's top block like this. */}
        <div className="mx-auto flex w-full max-w-5xl gap-4 pt-[var(--shell-top)] tablet:p-6">
          <h1 className="sr-only">Settings</h1>
          {isMobile ? (
            <SettingsMenuMobile
              isOpen={isMenuOpen}
              onClose={onBack}
              page={page}
              onNavigate={onNavigate}
            />
          ) : (
            <SettingsMenuDesktop page={page} onNavigate={onNavigate} />
          )}
          <AccountPageContainer key={page} title={getPageTitle(page)}>
            <PageContent page={page} onNavigate={onNavigate} />
            {(!isMobile || store.pendingCount > 0) && (
              <ChangesDock
                defaultMessage="Changes save as you go."
                primaryLabel="See my feed"
                onPrimary={onBack}
                isCompact={isMobile}
                className={
                  isMobile && phoneFieldPages.includes(page)
                    ? 'bottom-[4.5rem]'
                    : undefined
                }
              />
            )}
          </AccountPageContainer>
        </div>
      </ShellPageProvider>
    </FeedSettingsEditContext.Provider>
  );
};
