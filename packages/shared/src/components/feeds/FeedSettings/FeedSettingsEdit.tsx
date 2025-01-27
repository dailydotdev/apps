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
import type { FeedSettingsMenu } from './types';
import { feedSettingsMenuTitle } from './types';
import { IconSize } from '../../Icon';
import { FeedSettingsEditContext } from './FeedSettingsEditContext';
import { FeedSettingsEditHeader } from './FeedSettingsEditHeader';
import { FeedSettingsEditBody } from './FeedSettingsEditBody';
import { FeedSettingsTitle } from './FeedSettingsTitle';
import { FeedType } from '../../../graphql/feed';

import { SuspenseLoader } from './components/SuspenseLoader';

export type FeedSettingsEditProps = {
  feedSlugOrId: string;
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

type TabOptions = {
  title: string;
  options: {
    icon: ReactElement;
    customElement?: ReactElement;
  };
};

export const FeedSettingsEdit = ({
  feedSlugOrId,
}: FeedSettingsEditProps): ReactElement => {
  const router = useRouter();
  const feedSettingsEditContext = useFeedSettingsEdit({ feedSlugOrId });
  const { feed, onBackToFeed } = feedSettingsEditContext;

  const tabs = useMemo(() => {
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
  }, [feed?.type]);

  const defaultView = useMemo(() => {
    return feedSettingsMenuTitle[router.query.dview as FeedSettingsMenu];
  }, [router.query.dview]);

  if (!feed) {
    return null;
  }

  return (
    <FeedSettingsEditContext.Provider value={feedSettingsEditContext}>
      <Modal
        isOpen
        className="h-full flex-1 overflow-auto !bg-surface-invert"
        kind={Modal.Kind.FlexibleCenter}
        size={Modal.Size.XLarge}
        tabs={tabs}
        onRequestClose={onBackToFeed}
        defaultView={defaultView}
      >
        <FeedSettingsEditHeader />
        <Modal.Sidebar>
          <Modal.Sidebar.List
            className="w-74 bg-transparent"
            title={<FeedSettingsTitle />}
            defaultOpen
          />
          <Modal.Sidebar.Inner>
            <FeedSettingsEditBody view={feedSettingsMenuTitle.general}>
              <FeedSettingsGeneralSection />
            </FeedSettingsEditBody>
            <FeedSettingsEditBody view={feedSettingsMenuTitle.tags}>
              <FeedSettingsTagsSection />
            </FeedSettingsEditBody>
            <FeedSettingsEditBody view={feedSettingsMenuTitle.sources}>
              <FeedSettingsContentSourcesSection />
            </FeedSettingsEditBody>
            <FeedSettingsEditBody view={feedSettingsMenuTitle.preferences}>
              <FeedSettingsContentPreferencesSection />
            </FeedSettingsEditBody>
            <FeedSettingsEditBody view={feedSettingsMenuTitle.ai}>
              <FeedSettingsAISection />
            </FeedSettingsEditBody>
            <FeedSettingsEditBody view={feedSettingsMenuTitle.filters}>
              <FeedSettingsFiltersSection />
            </FeedSettingsEditBody>
            <FeedSettingsEditBody view={feedSettingsMenuTitle.blocking}>
              <FeedSettingsBlockingSection />
            </FeedSettingsEditBody>
          </Modal.Sidebar.Inner>
        </Modal.Sidebar>
      </Modal>
    </FeedSettingsEditContext.Provider>
  );
};
