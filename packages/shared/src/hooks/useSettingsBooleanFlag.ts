import { useSettingsContext } from '../contexts/SettingsContext';
import type { SettingsFlags } from '../graphql/settings';

type BooleanFlagKey = NonNullable<
  {
    [K in keyof SettingsFlags]: SettingsFlags[K] extends boolean | undefined
      ? K
      : never;
  }[keyof SettingsFlags]
>;

interface UseSettingsBooleanFlag {
  value: boolean;
  set: (value: boolean) => Promise<unknown>;
  toggle: () => Promise<unknown>;
}

/**
 * Reads a boolean flag from `SettingsFlags` and exposes setters that persist
 * through the shared `useSettingsContext`. An unset flag falls back to
 * `defaultValue`, so a flag that ships on by default stays distinguishable from
 * one the user explicitly turned off. Only accepts keys whose value type is
 * `boolean | undefined`.
 */
export const useSettingsBooleanFlag = <K extends BooleanFlagKey>(
  key: K,
  defaultValue = false,
): UseSettingsBooleanFlag => {
  const { flags, updateFlag } = useSettingsContext();
  const stored = flags?.[key];
  const value = stored === undefined ? defaultValue : Boolean(stored);
  return {
    value,
    set: (next) => updateFlag(key, next as SettingsFlags[K]),
    toggle: () => updateFlag(key, !value as SettingsFlags[K]),
  };
};
