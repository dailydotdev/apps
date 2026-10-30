import classNames from 'classnames';
import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { SearchField } from '../../../fields/SearchField';
import { ShellField } from '../../../shell/ShellField';
import { ModalTabs } from '../../../modals/common/ModalTabs';
import {
  ModalKind,
  ModalPropsContext,
  ModalSize,
  useModalContext,
} from '../../../modals/common/types';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../typography/Typography';
import { FollowingUserList } from '../components/FollowingUserList';
import { FollowingSourceList } from '../components/FollowingSourceList';
import { SourceType } from '../../../../graphql/sources';
import { SearchPanelSourceSuggestions } from '../../../search/SearchPanel/SearchPanelSourceSuggestions';
import { SearchPanelUserSuggestions } from '../../../search/SearchPanel/SearchPanelUserSuggestions';
import type { SearchPanelContextValue } from '../../../search/SearchPanel/SearchPanelContext';
import { SearchPanelContext } from '../../../search/SearchPanel/SearchPanelContext';
import type { SearchProviderEnum } from '../../../../graphql/search';
import { defaultSearchProvider, providerToLabelTextMap } from '../../../search';
import { generateQueryKey, RequestKey } from '../../../../lib/query';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { useMutationSubscription } from '../../../../hooks';
import { contentPreferenceMutationMatcher } from '../../../../hooks/contentPreference/types';
import { useFeedSettingsEditContext } from '../FeedSettingsEditContext';
import { useIsPhone } from '../../../../hooks/useViewSize';
import { Segments, ShellRow } from '../../../shell/ShellRow';
import { useQueryTab } from '../../../shell/useQueryTab';
import { Divider } from '../../../utilities/Divider';
import { FeedType } from '../../../../graphql/feed';
import useFeedSettings from '../../../../hooks/useFeedSettings';
import { getContentSourceList } from '../../../filters/helpers';
import { useForYouControls } from '../../../../features/feedExplain/useFeedExplainMode';
import { ForYouSources } from '../../../../features/feedExplain/components/ForYouSources';
import { BlockedNote } from '../../../../features/feedExplain/components/SettingsList';

enum Tabs {
  Sources = 'Sources',
  Squads = 'Squads',
  Users = 'Users',
}
const tabs = Object.values(Tabs);
const noop = () => undefined;

/** Blocked sources, leaving out the post types Content preferences hides. */
const BlockedSourcesNote = (): ReactElement | null => {
  const { feedSettings, advancedSettings } = useFeedSettings();
  const postTypes = new Set(
    getContentSourceList(advancedSettings ?? []).map(
      ({ options }) => options?.source?.id,
    ),
  );
  const blocked =
    feedSettings?.excludeSources?.filter(({ id }) => !postTypes.has(id))
      .length ?? 0;

  if (!blocked) {
    return null;
  }

  return (
    <BlockedNote>
      {`You blocked ${blocked} ${
        blocked === 1 ? 'source' : 'sources'
      }, so their posts never show.`}
    </BlockedNote>
  );
};

export const FeedSettingsContentSourcesSection = (): ReactElement => {
  const isInModal = !!useModalContext().onRequestClose;
  const { editFeedSettings, isNewFeed, feed } = useFeedSettingsEditContext();
  const { isAvailable: hasForYouControls } = useForYouControls();
  const isMainFeed = feed?.type === FeedType.Main;
  // For You lists its follows with their boosts where its ranking takes them,
  // so the tabs of follows below are left for search.
  const hasForYouSources = isMainFeed && hasForYouControls;
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const isPhone = useIsPhone();
  const {
    activeTab: activeView,
    isTabKnown,
    setActiveTab,
    segments,
  } = useQueryTab(tabs, { isAddressed: !isNewFeed });

  type SearchPanelState = {
    provider: SearchProviderEnum | undefined;
    query: string;
    isActive: boolean;
    providerText: string | undefined;
    providerIcon: ReactElement | undefined;
  };

  const [fieldValue, setFieldValue] = useState('');
  const [state, setState] = useState<SearchPanelState>(() => {
    return {
      provider: undefined,
      query: '',
      isActive: false,
      providerText: undefined,
      providerIcon: undefined,
    };
  });

  const searchPanel = useMemo<SearchPanelContextValue>(() => {
    return {
      ...state,
      setProvider: ({ provider, text, icon }) => {
        setState((currentState) => {
          return {
            ...currentState,
            provider,
            providerText: text || undefined,
            providerIcon: icon || undefined,
          };
        });
      },
      setActive: ({ isActive }) => {
        setState((currentState) => {
          return {
            ...currentState,
            isActive,
          };
        });
      },
    };
  }, [state]);

  const onQueryChange = (newValue: string) => {
    setState((currentState) => {
      return {
        ...currentState,
        query: newValue,
        // reset provider label while typing
        provider: undefined,
        providerText: providerToLabelTextMap[defaultSearchProvider],
        providerIcon: undefined,
      };
    });
  };

  useMutationSubscription({
    matcher: contentPreferenceMutationMatcher,
    callback: () => {
      editFeedSettings();

      return searchPanel.query?.length
        ? queryClient.invalidateQueries({
            queryKey: generateQueryKey(
              RequestKey.ContentPreference,
              user,
              RequestKey.UserFollowing,
            ),
          })
        : queryClient.invalidateQueries({
            queryKey: generateQueryKey(RequestKey.Search, user, 'suggestions'),
          });
    },
  });

  return (
    <div
      className={classNames(
        'flex flex-col gap-6',
        isInModal && 'pb-16 tablet:pb-0',
      )}
    >
      {hasForYouSources && (
        <>
          <ForYouSources />
          <BlockedSourcesNote />
          <Divider className="my-1 bg-border-subtlest-tertiary" />
          <Typography
            tag={TypographyTag.H2}
            type={TypographyType.Body}
            className="tablet:typo-title3"
            bold
          >
            Follow more sources and people
          </Typography>
          {!searchPanel.query?.length && (
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Tertiary}
            >
              Search for a source, squad or person to follow.
            </Typography>
          )}
        </>
      )}
      <SearchPanelContext.Provider value={searchPanel}>
        <SearchField
          aria-label="Search sources, squads, or users"
          className="hidden border-none !bg-background-subtle tablet:flex"
          inputId="search-filters"
          placeholder="Search sources, squads, or users"
          valueChanged={onQueryChange}
        />
        <ShellField
          overModal={isInModal}
          placeholder="Search sources, squads, or users"
          value={fieldValue}
          onChange={(value) => {
            setFieldValue(value);
            onQueryChange(value);
          }}
        />
        {!hasForYouSources && (
          <Typography
            color={TypographyColor.Tertiary}
            type={TypographyType.Callout}
          >
            Following sources, squads, and users is a great way to tell the
            system where you want your content to come from. It&apos;s a strong
            starting signal for your feed, and as you engage with content over
            time, its weight gradually decreases in favor of stronger signals
            based on your actual activity.
          </Typography>
        )}
        {!hasForYouSources && isMainFeed && <BlockedSourcesNote />}
        {searchPanel.query?.length ? (
          <>
            <SearchPanelSourceSuggestions title="Sources" showFollow />
            <SearchPanelUserSuggestions title="Users" showFollow />
          </>
        ) : (
          !hasForYouSources && (
            <ModalPropsContext.Provider
              value={{
                tabs,
                activeView,
                setActiveView: (view) => {
                  if (view !== undefined) {
                    setActiveTab(view as Tabs);
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
                {isTabKnown && activeView === Tabs.Sources && (
                  <FollowingSourceList />
                )}
                {isTabKnown && activeView === Tabs.Squads && (
                  <FollowingSourceList type={SourceType.Squad} />
                )}
                {isTabKnown && activeView === Tabs.Users && (
                  <FollowingUserList />
                )}
              </div>
            </ModalPropsContext.Provider>
          )
        )}
      </SearchPanelContext.Provider>
    </div>
  );
};
