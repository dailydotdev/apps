import React, { ReactElement, useContext, useState } from 'react';
import { FeedSettingsEditContext } from '../FeedSettingsEditContext';
import { Origin } from '../../../../lib/log';
import {
  ModalKind,
  ModalPropsContext,
  ModalSize,
} from '../../../modals/common/types';
import { ModalTabs } from '../../../modals/common/ModalTabs';
import useDebounceFn from '../../../../hooks/useDebounceFn';
import { useTagSearch } from '../../../../hooks/useTagSearch';
import { SearchField } from '../../../fields/SearchField';

import useFeedSettings from '../../../../hooks/useFeedSettings';
import useTagAndSource from '../../../../hooks/useTagAndSource';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../typography/Typography';
import { BlockedWords } from '../../../filters/BlockedWords';
import { BlockIcon } from '../../../icons';
import TagItemList from '../../../filters/TagItemList';

enum FeedSettingsBlockingSectionTabs {
  Sources = 'Sources',
  Squads = 'Squads',
  Users = 'Users',
  Tags = 'Tags',
}

const tabs = Object.values(FeedSettingsBlockingSectionTabs);

const noop = () => undefined;

export const FeedSettingsBlockingSection = (): ReactElement => {
  const { feed, onTagClick } = useContext(FeedSettingsEditContext);
  const [activeView, setActiveView] = useState<string>(
    () => FeedSettingsBlockingSectionTabs.Sources,
  );
  const { feedSettings } = useFeedSettings({ feedId: feed?.id });
  const { onUnfollowTags } = useTagAndSource({
    origin: Origin.CustomFeed,
    feedId: feed?.id,
    shouldFilterLocally: true,
    shouldUpdateAlerts: true,
  });

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onSearch] = useDebounceFn(setSearchQuery, 200);

  const { data: searchResult } = useTagSearch({
    value: searchQuery,
    origin: Origin.CustomFeed,
  });

  return (
    <div className="flex flex-col gap-6">
      <SearchField
        aria-label="Search sources, squads, users, or tags"
        className="border-none !bg-background-subtle"
        inputId="search-filters"
        placeholder="Search sources, squads, users, or tags"
        valueChanged={onSearch}
      />
      <Typography
        color={TypographyColor.Tertiary}
        type={TypographyType.Callout}
      >
        Manage everything you’ve excluded from your feed. Search and block
        sources, squads, users, or tags to fine-tune your content.
      </Typography>
      <BlockedWords />
      <ModalPropsContext.Provider
        value={{
          tabs,
          activeView,
          setActiveView,
          onRequestClose: noop,
          kind: ModalKind.FlexibleCenter,
          size: ModalSize.Medium,
        }}
      >
        <ModalTabs className="border-b border-border-subtlest-tertiary pb-[0.70rem]" />
        <div className="flex w-full max-w-full flex-col">
          {activeView === FeedSettingsBlockingSectionTabs.Sources && (
            <p>Sources</p>
          )}
          {activeView === FeedSettingsBlockingSectionTabs.Squads && (
            <p>Squads</p>
          )}
          {activeView === FeedSettingsBlockingSectionTabs.Users && <p>Users</p>}
          {activeView === FeedSettingsBlockingSectionTabs.Tags && (
            <TagItemList
              tags={feedSettings?.blockedTags}
              tooltip="Unblock tag"
              emptyText="No blocked tags."
              rowIcon={<BlockIcon />}
            />
          )}
        </div>
      </ModalPropsContext.Provider>
    </div>
  );
};
