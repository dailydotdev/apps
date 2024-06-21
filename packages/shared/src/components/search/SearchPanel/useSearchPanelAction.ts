import { HTMLAttributes, ReactElement, useContext } from 'react';
import { SearchProviderEnum } from '../../../graphql/search';
import { SearchPanelContext } from './SearchPanelContext';
import { providerToLabelTextMap } from './common';

export type UseSearchPanelActionProps = {
  provider: SearchProviderEnum;
  text?: string;
  icon?: ReactElement;
};

export type UseSearchPanelAction = {
  onMouseEnter: HTMLAttributes<HTMLElement>['onMouseEnter'];
  onMouseLeave: HTMLAttributes<HTMLElement>['onMouseLeave'];
  onFocus: HTMLAttributes<HTMLElement>['onFocus'];
  onBlur: HTMLAttributes<HTMLElement>['onBlur'];
};

export const useSearchPanelAction = ({
  provider,
  text,
  icon,
}: UseSearchPanelActionProps): UseSearchPanelAction => {
  const searchPanel = useContext(SearchPanelContext);

  const onActive = () => {
    searchPanel.setProvider({
      provider,
      text: text || providerToLabelTextMap[provider],
      icon,
    });
  };

  const onInactive = () => {
    searchPanel.setProvider({
      provider: undefined,
    });
  };

  return {
    onMouseEnter: onActive,
    onMouseLeave: onInactive,
    onFocus: (event) => {
      if (event?.target instanceof HTMLElement) {
        const element = event.target;
        element.setAttribute('data-search-panel-active', 'true');
      }

      onActive();
    },
    onBlur: (event) => {
      if (event?.target instanceof HTMLElement) {
        const element = event.target;
        element.removeAttribute('data-search-panel-active');
      }

      onInactive();
    },
  };
};
