import type { AdvancedSettings } from '../../../graphql/feedSettings';
import {
  getAdvancedContentTypes,
  getContentCurationList,
  getContentSourceList,
} from '../../filters/helpers';
import type { Source } from '../../../graphql/sources';
import { TOGGLEABLE_TYPES } from '../../feeds/FeedSettings/sections/FeedSettingsContentPreferencesSection';

/**
 * Types the API still returns but the post-signup funnel no longer offers. The
 * paid funnel keeps them, so this is applied per-funnel — and it has to be
 * applied to the enable gate as well as the rendered cards, or the "pick at
 * least one" guard counts a card nobody can see.
 *
 * Keyed on the API's display copy, which is how every other join into this data
 * already works: `TOGGLEABLE_TYPES` and `getAdvancedContentTypes` select by
 * title, and `contentTypeIcon` maps icons by title. A backend rename therefore
 * un-retires these cards — the same blast radius a rename already has on the
 * icon and toggle lists, and the reason these three lists live next to the
 * cards they describe. `AdvancedSettings.id` is an autoincrement row id, so it
 * would be a magic number here rather than a stabler key.
 */
export const RETIRED_CONTENT_TITLES = ['Community picks', 'Standups'];

export const withoutRetiredTitles = <T extends { title: string }>(
  items: T[],
  isOnboarding?: boolean,
): T[] =>
  isOnboarding
    ? items.filter(({ title }) => !RETIRED_CONTENT_TITLES.includes(title))
    : items;

interface GetContentTypeNotEmptyProps {
  advancedSettings: AdvancedSettings[];
  selectedSettings: Record<string, boolean>;
  checkSourceBlocked: (source: Source) => boolean;
  isOnboarding?: boolean;
}

export const getContentTypeNotEmpty = ({
  advancedSettings,
  selectedSettings,
  checkSourceBlocked,
  isOnboarding,
}: GetContentTypeNotEmptyProps): boolean => {
  const contentSourceList = withoutRetiredTitles(
    getContentSourceList(advancedSettings),
    isOnboarding,
  );
  const contentCurationList = withoutRetiredTitles(
    getContentCurationList(advancedSettings),
    isOnboarding,
  );

  const advancedSettingsSelected = (settings: AdvancedSettings[]) =>
    settings
      .map(({ id, defaultEnabledState }) => {
        return selectedSettings[id] ?? defaultEnabledState;
      })
      .some((setting) => setting === true);

  const advancedSettingsCurationListSelected =
    advancedSettingsSelected(contentCurationList);

  const listedTypes = withoutRetiredTitles(
    getAdvancedContentTypes(TOGGLEABLE_TYPES, advancedSettings),
    isOnboarding,
  );
  const selectedSomeListedTypes = advancedSettingsSelected(listedTypes);

  const sourceListSelected = contentSourceList
    // `options` is optional on AdvancedSettings, and the rendered cards already
    // skip entries without a source — so the gate has to skip them too.
    .map(({ options }) => options?.source)
    .filter((source): source is Source => !!source)
    .some((source) => !checkSourceBlocked(source));

  return (
    advancedSettingsCurationListSelected ||
    selectedSomeListedTypes ||
    sourceListSelected
  );
};
