import { createContext } from 'react';
import { SearchProviderEnum } from '../../../graphql/search';

export type SearchPanelContextValue = {
  provider: SearchProviderEnum;
  query: string;
  isActive: boolean;
  setProvider: (provider: SearchProviderEnum) => void;
  setActive: (isActive: boolean) => void;
};

const noop = () => undefined;

export const SearchPanelContext = createContext<SearchPanelContextValue>({
  provider: SearchProviderEnum.Posts,
  query: '',
  isActive: false,
  setProvider: noop,
  setActive: noop,
});
