import { ControlSection } from '../FeedScreenContext';

/** Feed settings, rebuilt around what shapes For You. */
export enum FeedSettingsPage {
  Overview = 'overview',
  Topics = 'topics',
  Sources = 'sources',
  Ranking = 'ranking',
  Filters = 'filters',
  AI = 'ai',
  General = 'general',
}

export const feedSettingsPages: Array<{ id: FeedSettingsPage; title: string }> =
  [
    { id: FeedSettingsPage.Overview, title: 'Overview' },
    { id: FeedSettingsPage.Topics, title: 'Topics' },
    { id: FeedSettingsPage.Sources, title: 'Sources and people' },
    { id: FeedSettingsPage.Ranking, title: 'Ranking' },
    { id: FeedSettingsPage.Filters, title: 'Filters' },
    { id: FeedSettingsPage.AI, title: 'AI superpowers' },
    { id: FeedSettingsPage.General, title: 'General' },
  ];

export const plural = (count: number, one: string, many: string): string =>
  `${count} ${count === 1 ? one : many}`;

export const getPageTitle = (page: FeedSettingsPage): string =>
  feedSettingsPages.find(({ id }) => id === page)?.title ?? '';

/** Where a link from the feed, like a card's "All topics", lands. */
export const sectionPage: Record<ControlSection, FeedSettingsPage> = {
  [ControlSection.Overview]: FeedSettingsPage.Overview,
  [ControlSection.Interests]: FeedSettingsPage.Topics,
  [ControlSection.Sources]: FeedSettingsPage.Sources,
  [ControlSection.Ranking]: FeedSettingsPage.Ranking,
  [ControlSection.LeftOut]: FeedSettingsPage.Overview,
  [ControlSection.Settings]: FeedSettingsPage.Filters,
  [ControlSection.Reset]: FeedSettingsPage.Overview,
};
