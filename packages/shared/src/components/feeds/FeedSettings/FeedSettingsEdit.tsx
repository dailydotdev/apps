import React, { ReactElement, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
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
import { FeedSettingsMenu } from './types';
import { IconSize } from '../../Icon';
import { FeedSettingsEditContext } from './FeedSettingsEditContext';
import { FeedSettingsEditHeader } from './FeedSettingsEditHeader';
import { FeedSettingsEditBody } from './FeedSettingsEditBody';
import { FeedSettingsGeneralSection } from './sections/FeedSettingsGeneralSection';
import { FeedSettingsTitle } from './FeedSettingsTitle';
import { FeedSettingsTagsSection } from './sections/FeedSettingsTagsSection';
import { FeedSettingsContentPreferencesSection } from './sections/FeedSettingsContentPreferencesSection';
import { FeedSettingsAISection } from './sections/FeedSettingsAISection';
import { FeedSettingsFiltersSection } from './sections/FeedSettingsFiltersSection';
import { FeedSettingsContentSourcesSection } from './sections/FeedSettingsContentSourcesSection';
import { webappUrl } from '../../../lib/constants';
import { usePlusSubscription } from '../../../hooks/usePlusSubscription';
import { FeedType } from '../../../graphql/feed';
import { FeedSettingsBlockingSection } from './sections/FeedSettingsBlockingSection';

export type FeedSettingsEditProps = {
  feedSlugOrId: string;
};

export const FeedSettingsEdit = ({
  feedSlugOrId,
}: FeedSettingsEditProps): ReactElement => {
  const router = useRouter();
  const feedSettingsEditContext = useFeedSettingsEdit({ feedSlugOrId });
  const { feed } = feedSettingsEditContext;
  const { isPlus } = usePlusSubscription();

  const tabs = useMemo(() => {
    return [
      {
        title: FeedSettingsMenu.General,
        options: { icon: <EditIcon size={IconSize.Small} /> },
      },
      {
        title: FeedSettingsMenu.Tags,
        options: { icon: <HashtagIcon size={IconSize.Small} /> },
      },
      {
        title: FeedSettingsMenu.ContentSources,
        options: { icon: <AddUserIcon size={IconSize.Small} /> },
      },
      {
        title: FeedSettingsMenu.ContentPreferences,
        options: { icon: <AppIcon size={IconSize.Small} /> },
      },
      {
        title: FeedSettingsMenu.AI,
        options: { icon: <MagicIcon size={IconSize.Small} /> },
      },
      feed?.type === FeedType.Custom && {
        title: FeedSettingsMenu.Filters,
        options: { icon: <FilterIcon size={IconSize.Small} /> },
      },
      {
        title: FeedSettingsMenu.Blocking,
        options: { icon: <BlockIcon size={IconSize.Small} /> },
      },
    ].filter(Boolean);
  }, [feed?.type]);

  const defaultView = useMemo(() => {
    const settingsMenuEntry = Object.entries(FeedSettingsMenu).find(
      ([key]) => router.query.dview === key.toLowerCase(),
    );
    const settingsMenuKey = settingsMenuEntry?.[1];

    return settingsMenuKey;
  }, [router.query.dview]);

  const canEditFeed = isPlus || feed?.type === FeedType.Main;

  useEffect(() => {
    if (!canEditFeed) {
      router.replace(webappUrl);
    }
  }, [canEditFeed, router, feedSlugOrId]);

  if (!canEditFeed) {
    return null;
  }

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
        onRequestClose={() => {
          if (feed?.type === FeedType.Main) {
            router.replace(webappUrl);
          } else {
            router.replace(`${webappUrl}feeds/${feedSlugOrId}`);
          }
        }}
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
            <FeedSettingsEditBody view={FeedSettingsMenu.General}>
              <FeedSettingsGeneralSection />
            </FeedSettingsEditBody>
            <FeedSettingsEditBody view={FeedSettingsMenu.Tags}>
              <FeedSettingsTagsSection />
            </FeedSettingsEditBody>
            <FeedSettingsEditBody view={FeedSettingsMenu.ContentSources}>
              <FeedSettingsContentSourcesSection />
            </FeedSettingsEditBody>
            <FeedSettingsEditBody view={FeedSettingsMenu.ContentPreferences}>
              <FeedSettingsContentPreferencesSection />
            </FeedSettingsEditBody>
            <FeedSettingsEditBody view={FeedSettingsMenu.AI}>
              <FeedSettingsAISection />
            </FeedSettingsEditBody>
            <FeedSettingsEditBody view={FeedSettingsMenu.Filters}>
              <FeedSettingsFiltersSection />
            </FeedSettingsEditBody>
            <FeedSettingsEditBody view={FeedSettingsMenu.Blocking}>
              <FeedSettingsBlockingSection />
            </FeedSettingsEditBody>
          </Modal.Sidebar.Inner>
        </Modal.Sidebar>
      </Modal>
    </FeedSettingsEditContext.Provider>
  );
};
