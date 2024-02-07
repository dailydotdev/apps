import { createContext } from 'react';
import { SearchProviderEnum } from '../../../graphql/search';

export type SearchPanelContextValue = {
  provider: SearchProviderEnum;
  providerText?: string;
  query: string;
  isActive: boolean;
  setProvider: ({
    provider,
    text,
  }: {
    provider: SearchProviderEnum;
    text?: string;
  }) => void;
  setActive: ({ isActive }: { isActive: boolean }) => void;
};

const noop = () => undefined;

export const SearchPanelContext = createContext<SearchPanelContextValue>({
  provider: SearchProviderEnum.Posts,
  providerText: undefined,
  query: '',
  isActive: false,
  setProvider: noop,
  setActive: noop,
});
