import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { SearchField } from '../../../fields/SearchField';
import { ModalTabs } from '../../../modals/common/ModalTabs';
import {
  ModalKind,
  ModalPropsContext,
  ModalSize,
} from '../../../modals/common/types';
import {
  Typography,
  TypographyColor,
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

enum Tabs {
  Sources = 'Sources',
  Squads = 'Squads',
  Users = 'Users',
}
const tabs = Object.values(Tabs);
const noop = () => undefined;

export const FeedSettingsContentSourcesSection = (): ReactElement => {
  const { editFeedSettings } = useFeedSettingsEditContext();
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const [activeView, setActiveViewState] = useState<string>(() => tabs[0]);

  type SearchPanelState = {
    provider: SearchProviderEnum | undefined;
    query: string;
    isActive: boolean;
    providerText: string | undefined;
    providerIcon: ReactElement | undefined;
  };

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
    <div className="flex flex-col gap-6">
      <SearchPanelContext.Provider value={searchPanel}>
        <SearchField
          aria-label="Search sources, squads, or users"
          className="border-none !bg-background-subtle"
          inputId="search-filters"
          placeholder="Search sources, squads, or users"
          valueChanged={(newValue) => {
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
          }}
        />
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
        {searchPanel.query?.length ? (
          <>
            <SearchPanelSourceSuggestions title="Sources" showFollow />
            <SearchPanelUserSuggestions title="Users" showFollow />
          </>
        ) : (
          <ModalPropsContext.Provider
            value={{
              tabs,
              activeView,
              setActiveView: (view) => {
                if (view !== undefined) {
                  setActiveViewState(view);
                }
              },
              onRequestClose: noop,
              kind: ModalKind.FlexibleCenter,
              size: ModalSize.Medium,
            }}
          >
            <ModalTabs className="border-b border-border-subtlest-tertiary pb-[0.70rem]" />
            <div className="flex w-full max-w-full flex-col">
              {activeView === Tabs.Sources && <FollowingSourceList />}
              {activeView === Tabs.Squads && (
                <FollowingSourceList type={SourceType.Squad} />
              )}
              {activeView === Tabs.Users && <FollowingUserList />}
            </div>
          </ModalPropsContext.Provider>
        )}
      </SearchPanelContext.Provider>
    </div>
  );
};
