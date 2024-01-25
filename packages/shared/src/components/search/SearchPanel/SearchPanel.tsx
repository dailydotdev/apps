import React, {
  ReactElement,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import { SearchPanelInput } from './SearchPanelInput';
import {
  SearchProviderEnum,
  minSearchQueryLength,
} from '../../../graphql/search';
import { SearchPanelContext } from './SearchPanelContext';
import { searchPanelGradientElementId } from './common';
import { SearchPanelAction } from './SearchPanelAction';
import { SearchPanelPostSuggestions } from './SearchPanelPostSuggestions';
import { Portal } from '../../tooltips/Portal';
import SettingsContext from '../../../contexts/SettingsContext';
import { useActions } from '../../../hooks';
import { ActionType } from '../../../graphql/actions';
import { AnalyticsEvent } from '../../../lib/analytics';
import { useAnalyticsContext } from '../../../contexts/AnalyticsContext';
import { FeedGradientBg } from '../../feeds/FeedGradientBg';

export type SearchPanelProps = {
  className?: string;
};

export const SearchPanel = ({ className }: SearchPanelProps): ReactElement => {
  const { sidebarExpanded } = useContext(SettingsContext);
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

  const gradientContainer = useMemo(() => {
    if (typeof state.isActive === 'undefined') {
      return undefined;
    }

    if (typeof document === 'undefined') {
      return undefined;
    }

    return document.getElementById(searchPanelGradientElementId);
  }, [state.isActive]);

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
      <Portal container={gradientContainer}>
        <FeedGradientBg
          className={classNames(
            'right-0 -z-1 hidden translate-x-0 opacity-0 transition-opacity duration-500 laptop:flex',
            sidebarExpanded
              ? '!-left-32 !max-w-[calc(100%)]'
              : '!max-w-[calc(100% - 2.75rem)] !-left-6',
            state.isActive ? 'opacity-100' : 'opacity-0',
          )}
        />
      </Portal>
    </SearchPanelContext.Provider>
  );
};

export default SearchPanel;
