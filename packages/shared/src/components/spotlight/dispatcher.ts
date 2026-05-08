import type { NextRouter } from 'next/router';
import { z } from 'zod';
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

const openModalPayloadSchema = z.object({
  modal: z.string(),
  props: z.record(z.string(), z.unknown()).optional(),
});

const openUrlPayloadSchema = z.object({
  url: z.url(),
  external: z.boolean().optional(),
});

const navigatePayloadSchema = z.object({
  path: z.string().min(1),
});

const toggleSettingPayloadSchema = z.object({
  key: z.enum(['theme', 'sidebar', 'insaneMode']),
});

const runClientActionPayloadSchema = z.object({
  handlerId: z.string().min(1),
});

const SCOPE_BY_HANDLER: Record<string, SpotlightScope> = {
  searchPosts: SpotlightScope.Posts,
  searchSources: SpotlightScope.Squads,
  searchTags: SpotlightScope.Tags,
  searchUsers: SpotlightScope.People,
};

const isLazyModalKey = (value: string): value is keyof typeof LazyModal =>
  Object.prototype.hasOwnProperty.call(LazyModal, value);

const parsePayload = <S extends z.ZodTypeAny>(
  kind: SpotlightActionKind,
  schema: S,
  payload: unknown,
): z.infer<S> => {
  const result = schema.safeParse(payload);
  if (!result.success) {
    throw new Error(
      `Spotlight: invalid payload for ${kind} (${result.error.message})`,
    );
  }
  return result.data;
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
    openModalPayloadSchema,
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
    openUrlPayloadSchema,
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
    navigatePayloadSchema,
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
    toggleSettingPayloadSchema,
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
    runClientActionPayloadSchema,
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
