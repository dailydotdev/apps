import type { NewTabMode } from '../../../graphql/settings';

export const NEW_TAB_MODES: readonly NewTabMode[] = [
  'discover',
  'focus',
] as const;

const LEGACY_MAPPINGS: Record<string, NewTabMode> = {
  zen: 'discover',
  'focus-mode': 'focus',
};

export const normaliseNewTabMode = (
  value: string | null | undefined,
): NewTabMode => {
  if (!value) {
    return 'discover';
  }
  if (NEW_TAB_MODES.includes(value as NewTabMode)) {
    return value as NewTabMode;
  }
  return LEGACY_MAPPINGS[value] ?? 'discover';
};
