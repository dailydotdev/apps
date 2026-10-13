import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  ModalKind,
  ModalPropsContext,
  ModalSize,
  useModalContext,
} from '../../../modals/common/types';
import { ModalTabs } from '../../../modals/common/ModalTabs';
import useDebounceFn from '../../../../hooks/useDebounceFn';
import { SearchField } from '../../../fields/SearchField';
import { ShellField } from '../../../shell/ShellField';

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
import { TutorialVideoButton } from '../../../video/TutorialVideoButton';
import { feedBlockingTutorialVideoId } from '../../../../lib/video';
import { feedBlockingTutorialVideo } from '../../../../lib/constants';
import { useIsPhone } from '../../../../hooks/useViewSize';
import { Segments, ShellRow } from '../../../shell/ShellRow';
import { useQueryTab } from '../../../shell/useQueryTab';
import { useFeedSettingsEditContext } from '../FeedSettingsEditContext';

enum FeedSettingsBlockingSectionTabs {
  Sources = 'Sources',
  Squads = 'Squads',
  Users = 'Users',
  Tags = 'Tags',
}

const tabs = Object.values(FeedSettingsBlockingSectionTabs);

const noop = () => undefined;

export const FeedSettingsBlockingSection = (): ReactElement => {
  // Inside the feed editor's full-screen modal a floating field would sit
  // under it, so the editor keeps its own field on phones.
  const isInModal = !!useModalContext().onRequestClose;
  const feedSettingsEditContext = useFeedSettingsEditContext();
  const isPhone = useIsPhone();
  const {
    activeTab: activeView,
    isTabKnown,
    setActiveTab,
    segments,
  } = useQueryTab(tabs, { isAddressed: !feedSettingsEditContext?.isNewFeed });

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [fieldValue, setFieldValue] = useState('');
  const [onSearch] = useDebounceFn<string>(
    (value) => setSearchQuery(value ?? ''),
    200,
  );

  return (
    <div className="flex flex-col gap-6">
      <SearchField
        aria-label="Search sources, squads, users, or tags"
        className={classNames(
          'border-none !bg-background-subtle',
          !isInModal && 'hidden tablet:flex',
        )}
        inputId="search-filters"
        placeholder="Search sources, squads, users, or tags"
        valueChanged={onSearch}
      />
      {!isInModal && (
        <ShellField
          placeholder="Search to block"
          value={fieldValue}
          onChange={(value) => {
            setFieldValue(value);
            onSearch(value);
          }}
        />
      )}
      <div className="flex flex-col items-start gap-2">
        <Typography
          color={TypographyColor.Tertiary}
          type={TypographyType.Callout}
        >
          Block sources, squads, users, or tags you never want to see. Anything
          blocked here is removed from your feed entirely.
        </Typography>
        <TutorialVideoButton
          videoId={feedBlockingTutorialVideoId}
          videoUrl={feedBlockingTutorialVideo}
          title="See less of what you don't want"
        />
      </div>
      <BlockedWords />
      <ModalPropsContext.Provider
        value={{
          tabs,
          activeView,
          setActiveView: (view) => {
            if (view !== undefined) {
              setActiveTab(view as FeedSettingsBlockingSectionTabs);
            }
          },
          onRequestClose: noop,
          kind: ModalKind.FlexibleCenter,
          size: ModalSize.Medium,
        }}
      >
        {isPhone ? (
          <div className="-mx-4">
            <ShellRow>
              <Segments items={segments} />
            </ShellRow>
          </div>
        ) : (
          <ModalTabs className="border-b border-border-subtlest-tertiary pb-[0.70rem]" />
        )}
        <div className="-mx-4 flex max-w-none flex-col tablet:mx-0 tablet:w-full tablet:max-w-full">
          {isTabKnown &&
            activeView === FeedSettingsBlockingSectionTabs.Sources && (
              <BlockedSourceList searchQuery={searchQuery} />
            )}
          {isTabKnown &&
            activeView === FeedSettingsBlockingSectionTabs.Squads && (
              <BlockedSourceList
                type={SourceType.Squad}
                searchQuery={searchQuery}
              />
            )}
          {isTabKnown &&
            activeView === FeedSettingsBlockingSectionTabs.Users && (
              <BlockedUserList searchQuery={searchQuery} />
            )}
          {isTabKnown &&
            activeView === FeedSettingsBlockingSectionTabs.Tags && (
              <div className="px-4 tablet:px-0">
                <BlockedTagList searchQuery={searchQuery} />
              </div>
            )}
        </div>
      </ModalPropsContext.Provider>
    </div>
  );
};
