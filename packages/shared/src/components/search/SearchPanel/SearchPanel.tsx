import React, {
  ReactElement,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { SearchPanelInput } from './SearchPanelInput';
import {
  SearchProviderEnum,
  minSearchQueryLength,
} from '../../../graphql/search';
import {
  SearchPanelContext,
  SearchPanelContextValue,
} from './SearchPanelContext';
import { SearchPanelAction } from './SearchPanelAction';
import { SearchPanelPostSuggestions } from './SearchPanelPostSuggestions';
import SettingsContext from '../../../contexts/SettingsContext';
import { useActions, useEventListener } from '../../../hooks';
import { ActionType } from '../../../graphql/actions';
import { AnalyticsEvent } from '../../../lib/analytics';
import { useAnalyticsContext } from '../../../contexts/AnalyticsContext';
import { searchPanelGradientQueryKey } from './common';
import { ArrowKeyEnum } from '../../../lib/func';
import { ArrowIcon } from '../../icons';
import { useSearchProvider } from '../../../hooks/search';
import { SearchPanelCustomAction } from './SearchPanelCustomAction';

export type SearchPanelProps = {
  className?: string;
};

export const SearchPanel = ({ className }: SearchPanelProps): ReactElement => {
  const queryClient = useQueryClient();
  useContext(SettingsContext);
  const { trackEvent } = useAnalyticsContext();
  const { completeAction, checkHasCompleted, isActionsFetched } = useActions();
  const { search } = useSearchProvider();
  const { query } = useRouter();

  const isTracked = useRef(false);
  const shouldShowPulse =
    isActionsFetched && !checkHasCompleted(ActionType.UsedSearchPanel);

  const [state, setState] = useState(() => {
    return {
      provider: undefined,
      query: '',
      isActive: false,
    };
  });

  const searchPanelRef = useRef<HTMLDivElement>();

  useEffect(() => {
    queryClient.setQueryData(searchPanelGradientQueryKey, state.isActive);
  }, [queryClient, state.isActive]);

  useEffect(() => {
    const searchQuery = query?.q?.toString();

    if (!searchQuery) {
      return;
    }

    setState((currentState) => {
      if (!currentState.query) {
        return { ...currentState, query: searchQuery };
      }

      return currentState;
    });
  }, [query?.q]);

  const searchPanel = useMemo<SearchPanelContextValue>(() => {
    return {
      ...state,
      setProvider: ({ provider, text }) => {
        setState((currentState) => {
          return { ...currentState, provider, providerText: text || undefined };
        });
      },
      setActive: ({ isActive }) => {
        setState((currentState) => {
          return {
            ...currentState,
            isActive,
            provider: currentState ? currentState.provider : undefined,
            providerText: undefined,
          };
        });
      },
    };
  }, [state]);

  useEventListener(searchPanelRef, 'keydown', (event) => {
    if (!state.isActive || !searchPanelRef.current) {
      return;
    }

    const navigableElements = [
      ...searchPanelRef.current.querySelectorAll<HTMLElement>(
        '[data-search-panel-item]',
      ),
    ];
    let activeElementIndex = navigableElements.findIndex(
      (element) => element.getAttribute('data-search-panel-active') === 'true',
    );

    if (activeElementIndex === -1) {
      activeElementIndex = 0;
    }

    const keyToIndexModifier: Partial<Record<ArrowKeyEnum, number>> = {
      [ArrowKeyEnum.Up]: -1,
      [ArrowKeyEnum.Down]: 1,
    };

    const supportedKeys = [ArrowKeyEnum.Up, ArrowKeyEnum.Down];

    const pressedKey = supportedKeys.find((key) => key === event.key);

    if (!pressedKey) {
      return;
    }

    event.preventDefault();

    const indexModifier = keyToIndexModifier[pressedKey];

    const nextElement = navigableElements[activeElementIndex + indexModifier];

    if (nextElement) {
      nextElement.focus();
    }
  });

  const showDropdown =
    state.isActive && state.query.length >= minSearchQueryLength;

  return (
    <SearchPanelContext.Provider value={searchPanel}>
      <div
        ref={searchPanelRef}
        className={classNames(className, 'flex flex-col')}
        data-testid="search-panel"
      >
        <SearchPanelInput
          className={{
            container: classNames(
              'w-full laptop:w-[35rem]',
              shouldShowPulse && 'highlight-pulse',
            ),
          }}
          valueChanged={(newValue) => {
            setState((currentState) => {
              return {
                ...currentState,
                query: newValue,
                // reset provider label while typing
                provider: undefined,
                providerText: undefined,
              };
            });
          }}
          inputProps={{
            value: state.query,
            onFocus: () => {
              searchPanel.setActive({
                isActive: true,
              });

              if (!isTracked.current && shouldShowPulse) {
                isTracked.current = true;

                trackEvent({
                  event_name: AnalyticsEvent.SearchHighlightAnimation,
                });
              }

              completeAction(ActionType.UsedSearchPanel);
            },
          }}
        >
          {showDropdown && (
            <div
              className={classNames(
                'absolute top-[3.7rem] w-full items-center rounded-b-16 border-none border-theme-divider-quaternary bg-theme-bg-primary px-3 py-2 laptop:h-auto laptop:border laptop:bg-overlay-float-salt laptop:shadow-2 laptop:backdrop-blur-[3.75rem]',
              )}
            >
              <div className="flex flex-1 flex-col">
                <SearchPanelAction provider={SearchProviderEnum.Posts} />
                <SearchPanelAction provider={SearchProviderEnum.Chat} />
                <SearchPanelPostSuggestions title="Posts on daily.dev" />
                <SearchPanelCustomAction
                  provider={SearchProviderEnum.Posts}
                  onClick={() => {
                    search({
                      provider: SearchProviderEnum.Posts,
                      query: state.query,
                    });
                  }}
                >
                  <div className="flex items-center justify-center text-theme-label-tertiary typo-subhead">
                    See more posts <ArrowIcon className="!size-4 rotate-90" />
                  </div>
                </SearchPanelCustomAction>
              </div>
            </div>
          )}
        </SearchPanelInput>
      </div>
    </SearchPanelContext.Provider>
  );
};

export default SearchPanel;
