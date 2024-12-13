import React, { ReactElement } from 'react';
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
import { FeedSettingsContentPreferencesSection } from './sections/FeedSettingsContentPreferencesSection';

export type FeedSettingsEditProps = {
  feedSlugOrId: string;
};

export const FeedSettingsEdit = ({
  feedSlugOrId,
}: FeedSettingsEditProps): ReactElement => {
  const router = useRouter();
  const feedSettingsEditContext = useFeedSettingsEdit({ feedSlugOrId });
  const { feed } = feedSettingsEditContext;

  const tabs = [
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
    {
      title: FeedSettingsMenu.Filters,
      options: { icon: <FilterIcon size={IconSize.Small} /> },
    },
    {
      title: FeedSettingsMenu.Blocking,
      options: { icon: <BlockIcon size={IconSize.Small} /> },
    },
  ];

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
          router.replace(`/feeds/${feedSlugOrId}`);
        }}
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
            <FeedSettingsEditBody view={FeedSettingsMenu.ContentPreferences}>
              <FeedSettingsContentPreferencesSection />
            </FeedSettingsEditBody>
          </Modal.Sidebar.Inner>
        </Modal.Sidebar>
      </Modal>
    </FeedSettingsEditContext.Provider>
  );
};
