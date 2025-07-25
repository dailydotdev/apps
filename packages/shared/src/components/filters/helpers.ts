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

/*
 * At the moment, we are only referencing the Video entity, but it should be based from the group that it is in.
 * Point being, we have to send multiple mutation requests at the same time if the user toggles the switch.
 * We should instead introduce a new mutation to handle an array of settings to toggle.
 * */
export const getVideoSetting = (
  advancedSettings: AdvancedSettings[],
): AdvancedSettings =>
  advancedSettings?.find(({ title }) => title === 'Videos');

export const getArticleSettings = (
  advancedSettings: AdvancedSettings[],
): AdvancedSettings[] =>
  advancedSettings?.filter(({ title }) =>
    ['Article', 'Share', 'Freeform', 'Welcome', 'Collection'].includes(title),
  ) || [];
