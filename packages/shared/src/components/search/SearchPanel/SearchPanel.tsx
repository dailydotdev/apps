import React, { ReactElement, useContext, useMemo, useState } from 'react';
import classNames from 'classnames';
import { SearchPanelInput } from './SearchPanelInput';
import { SearchProviderEnum } from '../../../graphql/search';
import { SearchPanelContext } from './SearchPanelContext';
import { minQueryLength, searchPanelGradientElementId } from './common';
import { SearchPanelAction } from './SearchPanelAction';
import { SearchPanelPostSuggestions } from './SearchPanelPostSuggestions';
import { useFeature } from '../../GrowthBookProvider';
import { feature } from '../../../lib/featureManagement';
import { SearchExperiment } from '../../../lib/featureValues';
import { FeedGradientBg } from '../../feeds/FeedGradientBg';
import Portal from '../../tooltips/Portal';
import SettingsContext from '../../../contexts/SettingsContext';

export type SearchPanelProps = {
  className?: string;
};

export const SearchPanel = ({ className }: SearchPanelProps): ReactElement => {
  const searchVersion = useFeature(feature.search);
  const { sidebarExpanded } = useContext(SettingsContext);

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

  const gradientContainer = useMemo(() => {
    if (typeof state.isActive === 'undefined') {
      return undefined;
    }

    if (typeof document === 'undefined') {
      return undefined;
    }

    return (
      document.getElementById(searchPanelGradientElementId) ||
      document.createElement('div') // unmounted div to not show the gradient
    );
  }, [state.isActive]);

  if (searchVersion !== SearchExperiment.V1) {
    return null;
  }

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
          <div
            className={classNames(
              'absolute top-[3.7rem] w-full items-center rounded-b-2xl border border-theme-divider-quaternary !bg-theme-bg-secondary-blur !bg-opacity-[0.8] px-3 py-2 backdrop-blur-md transition-opacity duration-200 ease-in-out',
              showDropdown ? 'opacity-100' : 'opacity-0',
            )}
          >
            <div className="flex flex-col">
              <SearchPanelAction provider={SearchProviderEnum.Posts} />
              <SearchPanelAction provider={SearchProviderEnum.Chat} />
              <SearchPanelPostSuggestions title="Posts" />
            </div>
          </div>
        </SearchPanelInput>
      </div>
      <Portal container={gradientContainer}>
        <FeedGradientBg
          className={classNames(
            '-top-9 -z-1 opacity-0 transition-opacity duration-500',
            sidebarExpanded ? '!-left-60' : '!-left-11',
            state.isActive ? 'opacity-100' : 'opacity-0',
          )}
        />
      </Portal>
    </SearchPanelContext.Provider>
  );
};
