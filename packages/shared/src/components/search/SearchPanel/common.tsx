import { SearchProviderEnum } from '../../../graphql/search';

export const searchPanelGradientQueryKey = ['search-panel-active-gradient'];

export const defaultSearchProvider = SearchProviderEnum.Posts;

export const providerToLabelTextMap: Record<SearchProviderEnum, string> = {
  [SearchProviderEnum.Posts]: 'Search posts',
  [SearchProviderEnum.Chat]: 'Ask daily.dev AI',
};
