import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { useFeedSettingsEdit } from './useFeedSettingsEdit';
import { Modal } from '../../modals/common/Modal';
import {
  AddUserIcon,
  AppIcon,
  BlockIcon,
  EditIcon,
  FilterIcon,
  HashtagIcon,
  MagicIcon,
} from '../../icons';
import { FeedSettingsMenu, feedSettingsMenuTitle } from './types';
import {
  forYouSettingsTitle,
  getForYouSettingsPage,
  useForYouSettingsPages,
} from './forYouSettingsPages';
import { IconSize } from '../../Icon';
import { FeedSettingsEditContext } from './FeedSettingsEditContext';
import { FeedSettingsEditHeader } from './FeedSettingsEditHeader';
import { FeedSettingsEditBody } from './FeedSettingsEditBody';
import { FeedSettingsTitle } from './FeedSettingsTitle';
import { FeedSettingsPlusGate } from './FeedSettingsPlusGate';
import { FeedType } from '../../../graphql/feed';

import { SuspenseLoader } from './components/SuspenseLoader';

export type FeedSettingsEditProps = {
  feedSlugOrId: string;
  isNewFeed?: boolean;
};

const FeedSettingsGeneralSection = dynamic(
  () =>
    import(
      /* webpackChunkName: "feedSettingsGeneralSection" */ './sections/FeedSettingsGeneralSection'
    ).then((mod) => mod.FeedSettingsGeneralSection),
  {
    loading: SuspenseLoader,
  },
);

const FeedSettingsTagsSection = dynamic(
  () =>
    import(
      /* webpackChunkName: "feedSettingsTagsSection" */ './sections/FeedSettingsTagsSection'
    ).then((mod) => mod.FeedSettingsTagsSection),
  {
    loading: SuspenseLoader,
  },
);

const FeedSettingsContentSourcesSection = dynamic(
  () =>
    import(
      /* webpackChunkName: "feedSettingsContentSourcesSection" */ './sections/FeedSettingsContentSourcesSection'
    ).then((mod) => mod.FeedSettingsContentSourcesSection),
  {
    loading: SuspenseLoader,
  },
);

const FeedSettingsContentPreferencesSection = dynamic(
  () =>
    import(
      /* webpackChunkName: "feedSettingsContentPreferencesSection" */ './sections/FeedSettingsContentPreferencesSection'
    ).then((mod) => mod.FeedSettingsContentPreferencesSection),
  {
    loading: SuspenseLoader,
  },
);

const FeedSettingsAISection = dynamic(
  () =>
    import(
      /* webpackChunkName: "feedSettingsAISection" */ './sections/FeedSettingsAISection'
    ).then((mod) => mod.FeedSettingsAISection),
  {
    loading: SuspenseLoader,
  },
);

const FeedSettingsFiltersSection = dynamic(
  () =>
    import(
      /* webpackChunkName: "feedSettingsFiltersSection" */ './sections/FeedSettingsFiltersSection'
    ).then((mod) => mod.FeedSettingsFiltersSection),
  {
    loading: SuspenseLoader,
  },
);

const FeedSettingsBlockingSection = dynamic(
  () =>
    import(
      /* webpackChunkName: "feedSettingsBlockingSection" */ './sections/FeedSettingsBlockingSection'
    ).then((mod) => mod.FeedSettingsBlockingSection),
  {
    loading: SuspenseLoader,
  },
);

const FeedSettingsOverviewSection = dynamic(
  () =>
    import(
      /* webpackChunkName: "feedSettingsOverviewSection" */ './sections/FeedSettingsOverviewSection'
    ).then((mod) => mod.FeedSettingsOverviewSection),
  {
    loading: SuspenseLoader,
  },
);

const ForYouRankingSettings = dynamic(
  () =>
    import(
      /* webpackChunkName: "forYouRankingSettings" */ '../../../features/feedExplain/components/ForYouRankingSettings'
    ).then((mod) => mod.ForYouRankingSettings),
  {
    loading: SuspenseLoader,
  },
);

const FeedSettingsContentFiltersSection = dynamic(
  () =>
    import(
      /* webpackChunkName: "feedSettingsContentFiltersSection" */ './sections/FeedSettingsContentFiltersSection'
    ).then((mod) => mod.FeedSettingsContentFiltersSection),
  {
    loading: SuspenseLoader,
  },
);

type TabOptions = {
  title: string;
  options: {
    icon: ReactElement;
    customElement?: ReactElement;
  };
};

export const FeedSettingsEdit = (
  props: FeedSettingsEditProps,
): ReactElement | null => {
  const router = useRouter();
  const feedSettingsEditContext = useFeedSettingsEdit(props);
  const { feed, onBackToFeed, onDiscard } = feedSettingsEditContext;
  const isMainFeed = feed?.type === FeedType.Main;
  const forYouPages = useForYouSettingsPages();

  const tabs = useMemo(() => {
    if (isMainFeed) {
      return forYouPages.map(
        ({ title, icon: Icon }): TabOptions => ({
          title,
          options: { icon: <Icon size={IconSize.Small} /> },
        }),
      );
    }

    const base: TabOptions[] = [
      {
        title: feedSettingsMenuTitle.general,
        options: { icon: <EditIcon size={IconSize.Small} /> },
      },
      {
        title: feedSettingsMenuTitle.tags,
        options: { icon: <HashtagIcon size={IconSize.Small} /> },
      },
      {
        title: feedSettingsMenuTitle.sources,
        options: { icon: <AddUserIcon size={IconSize.Small} /> },
      },
      {
        title: feedSettingsMenuTitle.preferences,
        options: { icon: <AppIcon size={IconSize.Small} /> },
      },
      {
        title: feedSettingsMenuTitle.ai,
        options: { icon: <MagicIcon size={IconSize.Small} /> },
      },
    ];

    if (feed?.type === FeedType.Custom) {
      base.push({
        title: feedSettingsMenuTitle.filters,
        options: { icon: <FilterIcon size={IconSize.Small} /> },
      });
    }

    base.push({
      title: feedSettingsMenuTitle.blocking,
      options: { icon: <BlockIcon size={IconSize.Small} /> },
    });

    return base.filter(Boolean);
  }, [feed?.type, isMainFeed, forYouPages]);

  const defaultView = useMemo(() => {
    const view = router.query.dview as string | undefined;
    if (!isMainFeed) {
      return feedSettingsMenuTitle[view as FeedSettingsMenu];
    }
    const page = forYouPages.find(
      ({ id }) => id === getForYouSettingsPage(view),
    );
    return page?.title;
  }, [router.query.dview, isMainFeed, forYouPages]);

  if (!feed) {
    return null;
  }

  return (
    <FeedSettingsEditContext.Provider value={feedSettingsEditContext}>
      <Modal
        isOpen
        className="h-full flex-1 overflow-auto !bg-background-default tablet:!bg-surface-invert"
        kind={Modal.Kind.FlexibleCenter}
        size={Modal.Size.XLarge}
        tabs={tabs}
        onRequestClose={async () => {
          const shouldDiscard = await onDiscard();

          if (!shouldDiscard) {
            return;
          }

          onBackToFeed({ action: 'discard' });
        }}
        defaultView={defaultView}
      >
        <FeedSettingsEditHeader />
        <Modal.Sidebar>
          <Modal.Sidebar.List
            className="w-full bg-transparent tablet:w-auto"
            title={<FeedSettingsTitle />}
            defaultOpen
          />
          <Modal.Sidebar.Inner>
            {isMainFeed ? (
              <>
                <FeedSettingsEditBody
                  view={forYouSettingsTitle[FeedSettingsMenu.Overview]}
                >
                  <FeedSettingsOverviewSection />
                </FeedSettingsEditBody>
                <FeedSettingsEditBody
                  view={forYouSettingsTitle[FeedSettingsMenu.Tags]}
                >
                  <FeedSettingsTagsSection />
                </FeedSettingsEditBody>
                <FeedSettingsEditBody
                  view={forYouSettingsTitle[FeedSettingsMenu.ContentSources]}
                >
                  <FeedSettingsContentSourcesSection />
                </FeedSettingsEditBody>
                <FeedSettingsEditBody
                  view={forYouSettingsTitle[FeedSettingsMenu.Ranking]}
                >
                  <ForYouRankingSettings />
                </FeedSettingsEditBody>
                <FeedSettingsEditBody
                  view={forYouSettingsTitle[FeedSettingsMenu.Filters]}
                >
                  <FeedSettingsContentFiltersSection />
                </FeedSettingsEditBody>
                <FeedSettingsEditBody
                  view={forYouSettingsTitle[FeedSettingsMenu.AI]}
                >
                  <FeedSettingsAISection />
                </FeedSettingsEditBody>
                <FeedSettingsEditBody
                  view={forYouSettingsTitle[FeedSettingsMenu.General]}
                >
                  <FeedSettingsGeneralSection />
                </FeedSettingsEditBody>
              </>
            ) : (
              <>
                <FeedSettingsEditBody view={feedSettingsMenuTitle.general}>
                  <FeedSettingsGeneralSection />
                </FeedSettingsEditBody>
                <FeedSettingsEditBody view={feedSettingsMenuTitle.tags}>
                  <FeedSettingsTagsSection />
                </FeedSettingsEditBody>
                <FeedSettingsEditBody view={feedSettingsMenuTitle.sources}>
                  <FeedSettingsPlusGate>
                    <FeedSettingsContentSourcesSection />
                  </FeedSettingsPlusGate>
                </FeedSettingsEditBody>
                <FeedSettingsEditBody view={feedSettingsMenuTitle.preferences}>
                  <FeedSettingsPlusGate>
                    <FeedSettingsContentPreferencesSection />
                  </FeedSettingsPlusGate>
                </FeedSettingsEditBody>
                <FeedSettingsEditBody view={feedSettingsMenuTitle.ai}>
                  <FeedSettingsAISection />
                </FeedSettingsEditBody>
                <FeedSettingsEditBody view={feedSettingsMenuTitle.filters}>
                  <FeedSettingsPlusGate>
                    <FeedSettingsFiltersSection />
                  </FeedSettingsPlusGate>
                </FeedSettingsEditBody>
                <FeedSettingsEditBody view={feedSettingsMenuTitle.blocking}>
                  <FeedSettingsPlusGate>
                    <FeedSettingsBlockingSection />
                  </FeedSettingsPlusGate>
                </FeedSettingsEditBody>
              </>
            )}
          </Modal.Sidebar.Inner>
        </Modal.Sidebar>
      </Modal>
    </FeedSettingsEditContext.Provider>
  );
};
