import { AdvancedSettings } from '../../../../graphql/feedSettings';
import {
  getContentCurationList,
  getContentSourceList,
  getVideoSetting,
} from '../../../filters/helpers';
import { Source } from '../../../../graphql/sources';

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

  const videoSetting = getVideoSetting(advancedSettings);

  const advancedSettingsSelected = (settings: AdvancedSettings[]) =>
    settings
      .map(({ id, defaultEnabledState }) => {
        return selectedSettings[id] ?? defaultEnabledState;
      })
      .some((setting) => setting === true);

  const advancedSettingsCurationListSelected =
    advancedSettingsSelected(contentCurationList);

  const advancedSettingsVideoSelected =
    !!videoSetting && advancedSettingsSelected([videoSetting]);

  const sourceListSelected = contentSourceList
    .map(({ options }) => options.source)
    .some((source) => !checkSourceBlocked(source));

  return (
    advancedSettingsCurationListSelected ||
    advancedSettingsVideoSelected ||
    sourceListSelected
  );
};
