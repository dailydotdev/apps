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
import dynamic from 'next/dynamic';
import { SearchPanelInput } from './SearchPanelInput';
import { minSearchQueryLength } from '../../../graphql/search';
import {
  SearchPanelContext,
  SearchPanelContextValue,
} from './SearchPanelContext';
import SettingsContext from '../../../contexts/SettingsContext';
import { useEventListener } from '../../../hooks';
import { defaultSearchProvider, providerToLabelTextMap } from './common';
import { ArrowKeyEnum } from '../../../lib/func';

const SearchPanelDropdown = dynamic(
  () =>
    import(
      /* webpackChunkName: "lazySearchPanelDropdown" */ './SearchPanelDropdown'
    ),
);

export type SearchPanelProps = {
  className?: SearchPanelClassName;
};

export type SearchPanelClassName = {
  container?: string;
  field?: string;
};

export const SearchPanel = ({ className }: SearchPanelProps): ReactElement => {
  useContext(SettingsContext);
  const { query } = useRouter();

  const [state, setState] = useState(() => {
    return {
      provider: undefined,
      query: '',
      isActive: false,
      providerText: undefined,
      providerIcon: undefined,
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
    };

    if (activeElementIndex !== 0) {
      keyToIndexModifier[ArrowKeyEnum.Left] = -1;
      keyToIndexModifier[ArrowKeyEnum.Right] = 1;
    }

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
              'w-full laptop:w-[26.25rem] laptop:max-w-[29.5rem] laptopL:w-full laptopL:max-w-[35rem]',
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
                providerIcon: undefined,
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
          {showDropdown && <SearchPanelDropdown query={state.query} />}
        </SearchPanelInput>
      </div>
    </SearchPanelContext.Provider>
  );
};

export default SearchPanel;
