import type { NextRouter } from 'next/router';
import type { LoggedUser } from '../../lib/user';
import { LazyModal } from '../modals/common/types';
import type { LazyModalType } from '../modals/common';
import type { SettingsContextData } from '../../contexts/SettingsContext';
import { ThemeMode } from '../../contexts/SettingsContext';
import { webappUrl } from '../../lib/constants';
import {
  type SpotlightAction,
  SpotlightActionKind,
} from '../../graphql/spotlight';
import { SpotlightScope, type SpotlightCommandResult } from './types';

export type SpotlightDispatchDeps = {
  router: Pick<NextRouter, 'push'>;
  openModal: (input: LazyModalType<LazyModal>) => void;
  settings: SettingsContextData;
  user?: Pick<LoggedUser, 'username'> | null;
  logout: (reason: string) => Promise<void> | void;
  pushScope: (scope: SpotlightScope) => void;
};

type PayloadRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is PayloadRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isPlainRecord = (value: unknown): value is PayloadRecord => {
  if (!isRecord(value)) {
    return false;
  }
  const { constructor } = value;
  if (constructor === undefined) {
    return true;
  }
  const { prototype } = constructor as { prototype: unknown };
  return (
    isRecord(prototype) &&
    Object.prototype.hasOwnProperty.call(prototype, 'isPrototypeOf')
  );
};

const copyStringRecord = (value: PayloadRecord): PayloadRecord | null => {
  const keys = Reflect.ownKeys(value).filter((key) => key !== '__proto__');
  if (keys.some((key) => typeof key !== 'string')) {
    return null;
  }
  return Object.fromEntries((keys as string[]).map((key) => [key, value[key]]));
};

const isFilledString = (value: unknown): value is string =>
  typeof value === 'string' && value.length >= 1;

const isUrl = (value: unknown): value is string => {
  if (typeof value !== 'string') {
    return false;
  }
  try {
    return !!new URL(value.trim());
  } catch (_) {
    return false;
  }
};

type OpenModalPayload = { modal: string; props?: PayloadRecord };

const parseOpenModalPayload = (payload: unknown): OpenModalPayload | null => {
  if (!isRecord(payload) || typeof payload.modal !== 'string') {
    return null;
  }
  if (payload.props === undefined) {
    return {
      modal: payload.modal,
      ...('props' in payload && { props: undefined }),
    };
  }
  const props = isPlainRecord(payload.props)
    ? copyStringRecord(payload.props)
    : null;
  return props ? { modal: payload.modal, props } : null;
};

type OpenUrlPayload = { url: string; external?: boolean };

const parseOpenUrlPayload = (payload: unknown): OpenUrlPayload | null => {
  if (
    !isRecord(payload) ||
    !isUrl(payload.url) ||
    (payload.external !== undefined && typeof payload.external !== 'boolean')
  ) {
    return null;
  }
  return {
    url: payload.url.trim(),
    ...('external' in payload && {
      external: payload.external as boolean | undefined,
    }),
  };
};

const parseNavigatePayload = (payload: unknown): { path: string } | null =>
  isRecord(payload) && isFilledString(payload.path)
    ? { path: payload.path }
    : null;

const SETTING_KEYS = ['theme', 'sidebar', 'insaneMode'] as const;

type SettingKey = (typeof SETTING_KEYS)[number];

const isSettingKey = (value: unknown): value is SettingKey =>
  SETTING_KEYS.some((key) => key === value);

const parseToggleSettingPayload = (
  payload: unknown,
): { key: SettingKey } | null =>
  isRecord(payload) && isSettingKey(payload.key) ? { key: payload.key } : null;

const parseRunClientActionPayload = (
  payload: unknown,
): { handlerId: string } | null =>
  isRecord(payload) && isFilledString(payload.handlerId)
    ? { handlerId: payload.handlerId }
    : null;

const SCOPE_BY_HANDLER: Record<string, SpotlightScope> = {
  searchPosts: SpotlightScope.Posts,
  searchSources: SpotlightScope.Squads,
  searchTags: SpotlightScope.Tags,
  searchUsers: SpotlightScope.People,
};

const isLazyModalKey = (value: string): value is keyof typeof LazyModal =>
  Object.prototype.hasOwnProperty.call(LazyModal, value);

const parsePayload = <T>(
  kind: SpotlightActionKind,
  parse: (payload: unknown) => T | null,
  payload: unknown,
): T => {
  const result = parse(payload);
  if (!result) {
    throw new Error(`Spotlight: invalid payload for ${kind}`);
  }
  return result;
};

const toggleTheme = async (settings: SettingsContextData): Promise<void> => {
  const next =
    settings.themeMode === ThemeMode.Dark ? ThemeMode.Light : ThemeMode.Dark;
  await settings.setTheme(next);
};

const dispatchOpenModal = (
  payload: unknown,
  deps: SpotlightDispatchDeps,
): void => {
  const { modal, props } = parsePayload(
    SpotlightActionKind.OpenModal,
    parseOpenModalPayload,
    payload,
  );
  if (!isLazyModalKey(modal)) {
    throw new Error(`Spotlight: unknown modal "${modal}"`);
  }
  deps.openModal({
    type: LazyModal[modal],
    props: props ?? {},
  } as LazyModalType<LazyModal>);
};

const dispatchOpenUrl = (
  payload: unknown,
  deps: SpotlightDispatchDeps,
): void => {
  const { url, external } = parsePayload(
    SpotlightActionKind.OpenUrl,
    parseOpenUrlPayload,
    payload,
  );
  if (external) {
    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
    return;
  }
  deps.router.push(url);
};

const PATH_TOKEN_PATTERN = /\$\{(\w+)\}/g;

const resolvePathTokens = (
  path: string,
  deps: SpotlightDispatchDeps,
): string => {
  const tokens: Record<string, string | undefined> = {
    username: deps.user?.username,
  };
  return path.replace(PATH_TOKEN_PATTERN, (_, key: string) => {
    const value = tokens[key];
    if (!value) {
      throw new Error(`Spotlight: missing token "${key}" for Navigate path`);
    }
    return value;
  });
};

const dispatchNavigate = (
  payload: unknown,
  deps: SpotlightDispatchDeps,
): void => {
  const { path: rawPath } = parsePayload(
    SpotlightActionKind.Navigate,
    parseNavigatePayload,
    payload,
  );
  const path = resolvePathTokens(rawPath, deps);
  const isAbsolute = /^https?:\/\//.test(path);
  deps.router.push(
    isAbsolute ? path : `${webappUrl}${path.replace(/^\//, '')}`,
  );
};

const dispatchToggleSetting = async (
  payload: unknown,
  deps: SpotlightDispatchDeps,
): Promise<void> => {
  const { key } = parsePayload(
    SpotlightActionKind.ToggleSetting,
    parseToggleSettingPayload,
    payload,
  );
  switch (key) {
    case 'theme':
      await toggleTheme(deps.settings);
      return;
    case 'sidebar':
      await deps.settings.toggleSidebarExpanded();
      return;
    case 'insaneMode':
      await deps.settings.toggleInsaneMode(!deps.settings.insaneMode);
      return;
    default: {
      const exhaustive: never = key;
      throw new Error(`Spotlight: unhandled setting key "${exhaustive}"`);
    }
  }
};

const dispatchRunClientAction = async (
  payload: unknown,
  deps: SpotlightDispatchDeps,
): Promise<SpotlightCommandResult | undefined> => {
  const { handlerId } = parsePayload(
    SpotlightActionKind.RunClientAction,
    parseRunClientActionPayload,
    payload,
  );

  const scope = SCOPE_BY_HANDLER[handlerId];
  if (scope) {
    deps.pushScope(scope);
    return { keepOpen: true };
  }

  switch (handlerId) {
    case 'logout':
      await deps.logout('spotlight');
      return undefined;
    default:
      throw new Error(`Spotlight: unknown client handler "${handlerId}"`);
  }
};

export const dispatchSpotlightAction = async (
  action: SpotlightAction,
  deps: SpotlightDispatchDeps,
): Promise<SpotlightCommandResult | undefined> => {
  switch (action.kind) {
    case SpotlightActionKind.OpenModal:
      dispatchOpenModal(action.payload, deps);
      return undefined;
    case SpotlightActionKind.OpenUrl:
      dispatchOpenUrl(action.payload, deps);
      return undefined;
    case SpotlightActionKind.Navigate:
      dispatchNavigate(action.payload, deps);
      return undefined;
    case SpotlightActionKind.ToggleSetting:
      await dispatchToggleSetting(action.payload, deps);
      return undefined;
    case SpotlightActionKind.RunClientAction:
      return dispatchRunClientAction(action.payload, deps);
    default:
      throw new Error(`Spotlight: unknown action kind "${action.kind}"`);
  }
};
