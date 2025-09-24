import type { AdvancedSettings } from '../../../graphql/feedSettings';
import {
  getAdvancedContentTypes,
  getContentCurationList,
  getContentSourceList,
} from '../../filters/helpers';
import type { Source } from '../../../graphql/sources';
import { TOGGLEABLE_TYPES } from '../../feeds/FeedSettings/sections/FeedSettingsContentPreferencesSection';

interface GetContentTypeNotEmptyProps {
  advancedSettings: AdvancedSettings[];
  selectedSettings: Record<string, boolean>;
  checkSourceBlocked: (source: Source) => boolean;
}

export const getContentTypeNotEmpty = ({
  advancedSettings,
  selectedSettings,
  checkSourceBlocked,
}: GetContentTypeNotEmptyProps): boolean => {
  const contentSourceList = getContentSourceList(advancedSettings);
  const contentCurationList = getContentCurationList(advancedSettings);

  const advancedSettingsSelected = (settings: AdvancedSettings[]) =>
    settings
      .map(({ id, defaultEnabledState }) => {
        return selectedSettings[id] ?? defaultEnabledState;
      })
      .some((setting) => setting === true);

  const advancedSettingsCurationListSelected =
    advancedSettingsSelected(contentCurationList);

  const listedTypes = getAdvancedContentTypes(
    TOGGLEABLE_TYPES,
    advancedSettings,
  );
  const selectedSomeListedTypes = advancedSettingsSelected(listedTypes);

  const sourceListSelected = contentSourceList
    .map(({ options }) => options.source)
    .some((source) => !checkSourceBlocked(source));

  return (
    advancedSettingsCurationListSelected ||
    selectedSomeListedTypes ||
    sourceListSelected
  );
};
