import { storageWrapper } from './storageWrapper';

export enum ExploreLayoutPreference {
  New = 'new',
  Cards = 'cards',
}

const EXPLORE_LAYOUT_PREFERENCE_KEY = 'explore_layout_preference';
export const exploreLayoutPreferenceChangedEvent =
  'explore-layout-preference-changed';

export const getExploreLayoutPreference = (): ExploreLayoutPreference => {
  const storedPreference = storageWrapper.getItem(EXPLORE_LAYOUT_PREFERENCE_KEY);

  if (storedPreference === ExploreLayoutPreference.Cards) {
    return ExploreLayoutPreference.Cards;
  }

  return ExploreLayoutPreference.New;
};

export const setExploreLayoutPreference = (
  preference: ExploreLayoutPreference,
): void => {
  storageWrapper.setItem(EXPLORE_LAYOUT_PREFERENCE_KEY, preference);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(exploreLayoutPreferenceChangedEvent));
  }
};
