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
import { SearchPanelInput } from './SearchPanelInput';
import {
  SearchProviderEnum,
  minSearchQueryLength,
} from '../../../graphql/search';
import { SearchPanelContext } from './SearchPanelContext';
import { SearchPanelAction } from './SearchPanelAction';
import { SearchPanelPostSuggestions } from './SearchPanelPostSuggestions';
import SettingsContext from '../../../contexts/SettingsContext';
import { useActions } from '../../../hooks';
import { ActionType } from '../../../graphql/actions';
import { AnalyticsEvent } from '../../../lib/analytics';
import { useAnalyticsContext } from '../../../contexts/AnalyticsContext';
import { searchPanelGradientQueryKey } from './common';

export type SearchPanelProps = {
  className?: string;
};

export const SearchPanel = ({ className }: SearchPanelProps): ReactElement => {
  const queryClient = useQueryClient();
  useContext(SettingsContext);
  const { trackEvent } = useAnalyticsContext();
  const { completeAction, checkHasCompleted, isActionsFetched } = useActions();

  const isTracked = useRef(false);
  const shouldShowPulse =
    isActionsFetched && !checkHasCompleted(ActionType.UsedSearchPanel);

  const [state, setState] = useState(() => {
    return {
      provider: SearchProviderEnum.Posts,
      query: '',
      isActive: false,
    };
  });

  useEffect(() => {
    queryClient.setQueryData(searchPanelGradientQueryKey, state.isActive);
  }, [queryClient, state.isActive]);

  const searchPanel = useMemo(() => {
    return {
      ...state,
      setProvider: (provider: SearchProviderEnum) => {
        setState((currentState) => {
          return { ...currentState, provider };
        });
      },
      setActive: (isActive: boolean) => {
        setState((currentState) => {
          return {
            ...currentState,
            isActive,
            provider: currentState
              ? currentState.provider
              : SearchProviderEnum.Posts,
          };
        });
      },
    };
  }, [state]);

  const showDropdown =
    state.isActive && state.query.length >= minSearchQueryLength;

  return (
    <SearchPanelContext.Provider value={searchPanel}>
      <div className={classNames(className, 'relative flex flex-col')}>
        <SearchPanelInput
          className={{
            container: classNames(
              'w-[35rem]',
              shouldShowPulse && 'highlight-pulse',
            ),
          }}
          valueChanged={(newValue) => {
            setState((currentState) => {
              return { ...currentState, query: newValue };
            });
          }}
          inputProps={{
            onFocus: () => {
              searchPanel.setActive(true);

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
                'absolute top-[3.7rem] w-full items-center rounded-b-16 border border-theme-divider-quaternary !bg-overlay-float-salt px-3 py-2 shadow-2 backdrop-blur-[3.75rem]',
              )}
            >
              <div className="flex flex-col">
                <SearchPanelAction provider={SearchProviderEnum.Posts} />
                <SearchPanelAction provider={SearchProviderEnum.Chat} />
                <SearchPanelPostSuggestions title="Posts on daily.dev" />
              </div>
            </div>
          )}
        </SearchPanelInput>
      </div>
    </SearchPanelContext.Provider>
  );
};

export default SearchPanel;
