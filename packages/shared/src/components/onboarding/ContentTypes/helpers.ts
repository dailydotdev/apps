import type { AdvancedSettings } from '../../../graphql/feedSettings';
import {
  getAdvancedContentTypes,
  getContentCurationList,
  getContentSourceList,
} from '../../filters/helpers';
import type { Source } from '../../../graphql/sources';
import { TOGGLEABLE_TYPES } from '../../feeds/FeedSettings/sections/FeedSettingsContentPreferencesSection';

// Keyed on display copy, as `TOGGLEABLE_TYPES`, `getAdvancedContentTypes` and
// `contentTypeIcon` already are — `AdvancedSettings.id` is an autoincrement row
// id. A backend rename un-retires these; `helpers.spec.ts` is the tripwire.
const RETIRED_CONTENT_TITLES = ['Community picks', 'Standups'];

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
    // The rendered cards skip entries without a source, so the gate must too.
    .map(({ options }) => options?.source)
    .filter((source): source is Source => !!source)
    .some((source) => !checkSourceBlocked(source));

  return (
    advancedSettingsCurationListSelected ||
    selectedSomeListedTypes ||
    sourceListSelected
  );
};
