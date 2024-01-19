import { createContext } from 'react';
import { SearchProviderEnum } from '../../../graphql/search';

export type SearchPanelContextValue = {
  provider: SearchProviderEnum;
  query: string;
  isActive: boolean;
  setProvider: (provider: SearchProviderEnum) => void;
  setActive: (isActive: boolean) => void;
};

// TODO AS-3-search-merge see if default values are needed for context and functions used
const noop = () => undefined;

export const SearchPanelContext = createContext<SearchPanelContextValue>({
  provider: SearchProviderEnum.Posts,
  query: '',
  isActive: false,
  setProvider: noop,
  setActive: noop,
});
