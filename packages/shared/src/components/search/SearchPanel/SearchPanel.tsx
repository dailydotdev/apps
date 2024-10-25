import React, {
  ReactElement,
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
import { defaultSearchProvider, providerToLabelTextMap } from './common';

const SearchPanelDropdown = dynamic(
  () =>
    import(
      /* webpackChunkName: "searchPanelDropdown" */ './SearchPanelDropdown'
    ),
  { ssr: false },
);

export type SearchPanelProps = {
  className?: SearchPanelClassName;
};

export type SearchPanelClassName = {
  container?: string;
  field?: string;
};

export const SearchPanel = ({ className }: SearchPanelProps): ReactElement => {
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
          {showDropdown && (
            <SearchPanelDropdown query={state.query} anchor={searchPanelRef} />
          )}
        </SearchPanelInput>
      </div>
    </SearchPanelContext.Provider>
  );
};

export default SearchPanel;
