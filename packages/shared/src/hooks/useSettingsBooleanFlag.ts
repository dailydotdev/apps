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
 * through the shared `useSettingsContext`. Coerces undefined to `false` so
 * callers can use the value directly. Only accepts keys whose value type is
 * `boolean | undefined`.
 */
export const useSettingsBooleanFlag = <K extends BooleanFlagKey>(
  key: K,
): UseSettingsBooleanFlag => {
  const { flags, updateFlag } = useSettingsContext();
  const value = Boolean(flags?.[key]);
  return {
    value,
    set: (next) => updateFlag(key, next as SettingsFlags[K]),
    toggle: () => updateFlag(key, !value as SettingsFlags[K]),
  };
};
