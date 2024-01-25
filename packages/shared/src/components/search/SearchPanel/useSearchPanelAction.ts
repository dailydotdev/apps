import { useContext } from 'react';
import { SearchProviderEnum } from '../../../graphql/search';
import { SearchPanelContext } from './SearchPanelContext';
import { providerToLabelTextMap } from './common';

export type UseSearchPanelActionProps = {
  provider: SearchProviderEnum;
  text?: string;
};

export type UseSearchPanelAction = {
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onFocus: () => void;
  onBlur: () => void;
};

export const useSearchPanelAction = ({
  provider,
  text,
}: UseSearchPanelActionProps): UseSearchPanelAction => {
  const searchPanel = useContext(SearchPanelContext);

  const onActive = () => {
    searchPanel.setProvider({
      provider,
      text: text || providerToLabelTextMap[provider],
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
    onFocus: onActive,
    onBlur: onInactive,
  };
};
