import type { ReactElement, ReactNode } from 'react';
import React, { Fragment, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { FeedSettingsEditContext } from '@dailydotdev/shared/src/components/feeds/FeedSettings/FeedSettingsEditContext';
import { FeedSettingsContentPreferencesSection } from '@dailydotdev/shared/src/components/feeds/FeedSettings/sections/FeedSettingsContentPreferencesSection';
import { FeedSettingsBlockingSection } from '@dailydotdev/shared/src/components/feeds/FeedSettings/sections/FeedSettingsBlockingSection';
import { FeedSettingsAISection } from '@dailydotdev/shared/src/components/feeds/FeedSettings/sections/FeedSettingsAISection';
import { FeedSettingsGeneralSection } from '@dailydotdev/shared/src/components/feeds/FeedSettings/sections/FeedSettingsGeneralSection';
import Toast from '@dailydotdev/shared/src/components/notifications/Toast';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { EyeIcon } from '@dailydotdev/shared/src/components/icons/Eye';
import { ShellPageProvider } from '@dailydotdev/shared/src/components/shell/ShellPageContext';
import { ShellBlock } from '@dailydotdev/shared/src/components/shell/ShellBlock';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  useViewSize,
  ViewSize,
} from '@dailydotdev/shared/src/hooks/useViewSize';
import { useQueryState } from '@dailydotdev/shared/src/hooks/utils/useQueryState';
import { TOAST_NOTIF_KEY } from '@dailydotdev/shared/src/hooks/useToastNotification';
import {
  generateQueryKey,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import { AccountPageContainer } from '../../../../../../webapp/components/layouts/SettingsLayout/AccountPageContainer';
import { navigationKey } from '../../../../../../webapp/components/layouts/SettingsLayout';
import { usePersonalization } from '../PersonalizationContext';
import { FeedSettingsPage, getPageTitle, plural } from './pages';
import { SettingsMenuDesktop, SettingsMenuMobile } from './SettingsMenu';
import { OverviewPage } from './OverviewPage';
import { TopicsPage } from './TopicsPage';
import { BlockedNote, SettingDivider } from './common';
import { bindSettingsStore, useMainFeedEditContext } from './settingsMocks';
import { rankingControls } from './sections';

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
    <Typography
      id={`${id}-title`}
      tag={TypographyTag.H2}
      type={TypographyType.Body}
      className="tablet:typo-title3"
      bold
    >
      {title}
    </Typography>
    {children}
  </section>
);

const SourcesPage = ({
  controls,
  onNavigate,
}: {
  controls: ReactNode;
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
    <>
      {controls}
      {blocked.length > 0 && (
        <BlockedNote
          text={`You blocked ${blocked.join(
            ' and ',
          )}, so their posts never show.`}
          onOpen={() => onNavigate(FeedSettingsPage.Filters)}
        />
      )}
    </>
  );
};

/** Content preferences and Blocked content, as one page of what never shows. */
const FiltersPage = (): ReactElement => (
  <>
    <PageSection id="filters-preferences" title="Content preferences">
      <FeedSettingsContentPreferencesSection />
    </PageSection>
    <SettingDivider />
    <PageSection id="filters-blocked" title="Blocked">
      <FeedSettingsBlockingSection />
    </PageSection>
  </>
);

const PageContent = ({
  page,
  onNavigate,
}: {
  page: FeedSettingsPage;
  onNavigate: (page: FeedSettingsPage) => void;
}): ReactElement => {
  const controls = rankingControls
    .filter((control) => control.page === page)
    .map(({ section, Controls }, index) => (
      <Fragment key={section}>
        {index > 0 && <SettingDivider />}
        <Controls />
      </Fragment>
    ));

  switch (page) {
    case FeedSettingsPage.Topics:
      return <TopicsPage controls={controls} onNavigate={onNavigate} />;
    case FeedSettingsPage.Sources:
      return <SourcesPage controls={controls} onNavigate={onNavigate} />;
    case FeedSettingsPage.Ranking:
      return <>{controls}</>;
    case FeedSettingsPage.Filters:
      return <FiltersPage />;
    case FeedSettingsPage.AI:
      return <FeedSettingsAISection />;
    case FeedSettingsPage.General:
      return <FeedSettingsGeneralSection />;
    default:
      return <OverviewPage controls={controls} onNavigate={onNavigate} />;
  }
};

/**
 * Every change confirms in the app's toast, with Undo, like the rest of
 * settings. A slider drag is one change, so it confirms once it settles.
 */
const useChangeToasts = (): void => {
  const store = usePersonalization();
  const client = useQueryClient();
  const storeRef = useRef(store);
  const shown = useRef({
    message: store.lastMessage,
    count: store.pendingCount,
  });
  storeRef.current = store;
  const { lastMessage, pendingCount } = store;

  useEffect(() => {
    const isUndo = pendingCount < shown.current.count;
    const isNew = lastMessage !== shown.current.message;
    shown.current = { message: lastMessage, count: pendingCount };
    if (isUndo || !isNew || !lastMessage) {
      return undefined;
    }
    const timeout = setTimeout(
      () =>
        client.setQueryData(TOAST_NOTIF_KEY, {
          message: lastMessage,
          timer: 5000,
          action: { copy: 'Undo', onClick: () => storeRef.current.undo() },
        }),
      300,
    );
    return () => clearTimeout(timeout);
  }, [client, lastMessage, pendingCount]);
};

/**
 * Settings with Feed settings rebuilt around personalization: the settings
 * menu and each page in the real page container.
 */
export const FeedSettingsScreen = ({
  initialPage = FeedSettingsPage.Overview,
  initialMenuOpen,
  onBack,
  onTune,
}: {
  initialPage?: FeedSettingsPage;
  /** Opens on the phone's settings menu, the page behind every section. */
  initialMenuOpen?: boolean;
  /** Back to For You, when the prototype opened settings from the feed. */
  onBack?: () => void;
  /** Opens For You in Tune mode at this page's controls. */
  onTune?: (page: FeedSettingsPage) => void;
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
  useChangeToasts();

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
              onClose={onBack ?? (() => undefined)}
              page={page}
              onNavigate={onNavigate}
            />
          ) : (
            <SettingsMenuDesktop page={page} onNavigate={onNavigate} />
          )}
          <AccountPageContainer
            key={page}
            title={getPageTitle(page)}
            // On a phone, back opens the settings menu, which leaves to the feed.
            onBack={isMobile ? undefined : onBack}
            actions={
              onTune &&
              rankingControls.some((control) => control.page === page) && (
                <Button
                  type="button"
                  variant={ButtonVariant.Float}
                  size={ButtonSize.Small}
                  icon={<EyeIcon />}
                  onClick={() => onTune(page)}
                >
                  Live preview
                </Button>
              )
            }
          >
            <section className="flex flex-col gap-4">
              <PageContent page={page} onNavigate={onNavigate} />
            </section>
          </AccountPageContainer>
        </div>
        <Toast autoDismissNotifications />
      </ShellPageProvider>
    </FeedSettingsEditContext.Provider>
  );
};
