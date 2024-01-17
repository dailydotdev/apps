import React, { ReactElement, useMemo, useState } from 'react';
import classNames from 'classnames';
import { SearchPanelInput } from './SearchPanelInput';
import { SearchProviderEnum } from '../../../graphql/search';
import { SearchPanelContext } from './SearchPanelContext';
import { minQueryLength } from './common';
import { SearchPanelAction } from './SearchPanelAction';
import { SearchPanelPostSuggestions } from './SearchPanelPostSuggestions';

export type SearchPanelProps = {
  className?: string;
};

export const SearchPanel = ({ className }: SearchPanelProps): ReactElement => {
  const [state, setState] = useState(() => {
    return {
      provider: SearchProviderEnum.Posts,
      query: '',
      isActive: false,
    };
  });

  const searchPanelContextValue = useMemo(() => {
    return {
      ...state,
      setProvider: (provider: SearchProviderEnum) => {
        setState((currentState) => {
          return { ...currentState, provider };
        });
      },
      setActive: (isActive: boolean) => {
        setState((currentState) => {
          return { ...currentState, isActive };
        });
      },
    };
  }, [state]);

  const showDropdown = state.isActive && state.query.length >= minQueryLength;

  return (
    <SearchPanelContext.Provider value={searchPanelContextValue}>
      <div className={classNames(className, 'relative flex flex-col')}>
        <SearchPanelInput
          className={{
            container: 'w-[35rem]',
          }}
          valueChanged={(newValue) => {
            setState((currentState) => {
              return { ...currentState, query: newValue };
            });
          }}
        >
          {showDropdown && (
            <div className="absolute w-full items-center rounded-b-2xl border border-theme-divider-quaternary !bg-theme-bg-secondary px-3 py-2 duration-200 ease-in-out">
              <div className="flex flex-col">
                <SearchPanelAction provider={SearchProviderEnum.Posts} />
                <SearchPanelAction provider={SearchProviderEnum.Chat} />
                <SearchPanelPostSuggestions title="Posts" />
              </div>
            </div>
          )}
        </SearchPanelInput>
      </div>
    </SearchPanelContext.Provider>
  );
};
