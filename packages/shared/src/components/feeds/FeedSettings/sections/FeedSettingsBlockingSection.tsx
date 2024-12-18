import React, { ReactElement, useState } from 'react';
import {
  ModalKind,
  ModalPropsContext,
  ModalSize,
} from '../../../modals/common/types';
import { ModalTabs } from '../../../modals/common/ModalTabs';
import useDebounceFn from '../../../../hooks/useDebounceFn';
import { SearchField } from '../../../fields/SearchField';

import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../typography/Typography';
import { BlockedWords } from '../../../filters/BlockedWords';
import { BlockedSourceList } from '../components/BlockedSourceList';
import { SourceType } from '../../../../graphql/sources';
import { BlockedUserList } from '../components/BlockedUserList';
import { BlockedTagList } from '../components/BlockedTagList';

enum FeedSettingsBlockingSectionTabs {
  Sources = 'Sources',
  Squads = 'Squads',
  Users = 'Users',
  Tags = 'Tags',
}

const tabs = Object.values(FeedSettingsBlockingSectionTabs);

const noop = () => undefined;

export const FeedSettingsBlockingSection = (): ReactElement => {
  const [activeView, setActiveView] = useState<string>(
    () => FeedSettingsBlockingSectionTabs.Sources,
  );

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onSearch] = useDebounceFn(setSearchQuery, 200);

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
            <BlockedSourceList searchQuery={searchQuery} />
          )}
          {activeView === FeedSettingsBlockingSectionTabs.Squads && (
            <BlockedSourceList
              type={SourceType.Squad}
              searchQuery={searchQuery}
            />
          )}
          {activeView === FeedSettingsBlockingSectionTabs.Users && (
            <BlockedUserList searchQuery={searchQuery} />
          )}
          {activeView === FeedSettingsBlockingSectionTabs.Tags && (
            <BlockedTagList searchQuery={searchQuery} />
          )}
        </div>
      </ModalPropsContext.Provider>
    </div>
  );
};
