import React, {
  ReactElement,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
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
import { useEventListener } from '../../../hooks';
import { defaultSearchProvider, providerToLabelTextMap } from './common';
import { ArrowKeyEnum } from '../../../lib/func';
import { ArrowIcon } from '../../icons';
import { useSearchProvider } from '../../../hooks/search';
import { SearchPanelCustomAction } from './SearchPanelCustomAction';
import { AnalyticsEvent } from '../../../lib/analytics';
import { useAnalyticsContext } from '../../../contexts/AnalyticsContext';
import { SearchPanelTagSuggestions } from './SearchPanelTagSuggestions';

export type SearchPanelProps = {
  className?: SearchPanelClassName;
};

export type SearchPanelClassName = {
  container?: string;
  field?: string;
};

export const SearchPanel = ({ className }: SearchPanelProps): ReactElement => {
  useContext(SettingsContext);
  const { search } = useSearchProvider();
  const { query } = useRouter();
  const { trackEvent } = useAnalyticsContext();

  const [state, setState] = useState(() => {
    return {
      provider: undefined,
      query: '',
      isActive: false,
      providerText: undefined,
    };
  });

  const searchPanelRef = useRef<HTMLDivElement>();

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
        '[data-search-panel-item="true"]',
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
      [ArrowKeyEnum.Left]: -1,
      [ArrowKeyEnum.Right]: 1,
    };

    const supportedKeys = Object.keys(keyToIndexModifier);

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
        className={classNames(className?.container, 'flex flex-col')}
        data-testid="search-panel"
      >
        <SearchPanelInput
          className={{
            container: classNames(
              'w-full laptop:w-[29.5rem] laptopL:w-[35rem]',
            ),
            field: className?.field,
          }}
          valueChanged={(newValue) => {
            setState((currentState) => {
              return {
                ...currentState,
                query: newValue,
                // reset provider label while typing
                provider: undefined,
                providerText: providerToLabelTextMap[defaultSearchProvider],
              };
            });
          }}
          inputProps={{
            value: state.query,
            onFocus: () => {
              searchPanel.setActive({
                isActive: true,
              });
            },
          }}
        >
          {showDropdown && (
            <div
              className={classNames(
                'absolute w-full items-center rounded-b-16 border-0 border-border-subtlest-tertiary bg-background-default px-3 py-2 laptop:h-auto laptop:border-x laptop:border-b laptop:bg-background-subtle laptop:shadow-2',
              )}
            >
              <div className="flex flex-1 flex-col">
                <SearchPanelAction provider={SearchProviderEnum.Posts} />
                <SearchPanelAction provider={SearchProviderEnum.Chat} />
                <SearchPanelTagSuggestions title="Tags" />
                <SearchPanelPostSuggestions title="Posts on daily.dev" />
                <SearchPanelCustomAction
                  provider={SearchProviderEnum.Posts}
                  onClick={() => {
                    trackEvent({
                      event_name: AnalyticsEvent.SubmitSearch,
                      extra: JSON.stringify({
                        query: state.query,
                        provider: SearchProviderEnum.Posts,
                      }),
                    });

                    search({
                      provider: SearchProviderEnum.Posts,
                      query: state.query,
                    });
                  }}
                >
                  <div className="flex items-center justify-center text-text-tertiary typo-subhead">
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
