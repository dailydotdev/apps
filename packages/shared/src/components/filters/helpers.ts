import type { AdvancedSettings } from '../../graphql/feedSettings';
import { AdvancedSettingsGroup } from '../../graphql/feedSettings';

export const getContentFromGroup = (
  advancedSettings: AdvancedSettings[],
  groupProp: AdvancedSettingsGroup[],
): AdvancedSettings[] =>
  advancedSettings?.filter(({ group }) => groupProp.includes(group)) ?? [];

export const getContentSourceList = (
  advancedSettings: AdvancedSettings[],
): AdvancedSettings[] =>
  getContentFromGroup(advancedSettings, [AdvancedSettingsGroup.ContentSource]);

export const getContentCurationList = (
  advancedSettings: AdvancedSettings[],
): AdvancedSettings[] =>
  getContentFromGroup(advancedSettings, [
    AdvancedSettingsGroup.ContentCuration,
    AdvancedSettingsGroup.SourceTypes,
  ]);

export const getAdvancedContentTypes = (
  titles: string[],
  advancedSettings: AdvancedSettings[],
) =>
  titles
    .map((title) =>
      advancedSettings?.find((advanced) => advanced.title === title),
    )
    .filter(Boolean);
