import { createContext, ReactElement } from 'react';
import { SearchProviderEnum } from '../../../graphql/search';

export type SearchPanelContextValue = {
  provider: SearchProviderEnum;
  providerText?: string;
  providerIcon?: ReactElement;
  query: string;
  isActive: boolean;
  setProvider: ({
    provider,
    text,
    icon,
  }: {
    provider: SearchProviderEnum;
    text?: string;
    icon?: ReactElement;
  }) => void;
  setActive: ({ isActive }: { isActive: boolean }) => void;
};

const noop = () => undefined;

export const SearchPanelContext = createContext<SearchPanelContextValue>({
  provider: SearchProviderEnum.Posts,
  providerText: undefined,
  providerIcon: undefined,
  query: '',
  isActive: false,
  setProvider: noop,
  setActive: noop,
});
