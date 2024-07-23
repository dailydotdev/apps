import {
  AdvancedSettings,
  AdvancedSettingsGroup,
} from '../../graphql/feedSettings';

export const getContentFromGroup = (
  advancedSettings: AdvancedSettings[],
  groupProp: AdvancedSettingsGroup,
): AdvancedSettings[] =>
  advancedSettings?.filter(({ group }) => group === groupProp) ?? [];

export const getContentSourceList = (
  advancedSettings: AdvancedSettings[],
): AdvancedSettings[] =>
  getContentFromGroup(advancedSettings, AdvancedSettingsGroup.ContentSource);

export const getContentCurationList = (
  advancedSettings: AdvancedSettings[],
): AdvancedSettings[] =>
  getContentFromGroup(advancedSettings, AdvancedSettingsGroup.ContentCuration);

/*
 * At the moment, we are only referencing the Video entity, but it should be based from the group that it is in.
 * Point being, we have to send multiple mutation requests at the same time if the user toggles the switch.
 * We should instead introduce a new mutation to handle an array of settings to toggle.
 * */
export const getVideoSetting = (
  advancedSettings: AdvancedSettings[],
): AdvancedSettings =>
  advancedSettings?.find(({ title }) => title === 'Videos');
