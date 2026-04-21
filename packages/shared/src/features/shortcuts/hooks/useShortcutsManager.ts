import { useCallback, useMemo, useRef } from 'react';
import { useSettingsContext } from '../../../contexts/SettingsContext';
import { useLogContext } from '../../../contexts/LogContext';
import { useToastNotification } from '../../../hooks/useToastNotification';
import {
  LogEvent,
  ShortcutsSourceType,
  TargetType,
} from '../../../lib/log';
import { canonicalShortcutUrl, withHttps } from '../../../lib/links';
import type { SettingsFlags } from '../../../graphql/settings';
import type {
  ImportSource,
  Shortcut,
  ShortcutMeta,
} from '../types';
import { MAX_SHORTCUTS, UNDO_TIMEOUT_MS, shortcutColorPalette } from '../types';
import { useShortcuts } from '../contexts/ShortcutsProvider';
import type { BrowserBookmark } from './useBrowserBookmarks';

const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const defaultColorForUrl = (url: string) => {
  try {
    const host = new URL(withHttps(url)).hostname;
    return shortcutColorPalette[
      hashString(host) % shortcutColorPalette.length
    ];
  } catch (_) {
    return shortcutColorPalette[0];
  }
};

export interface UseShortcutsManager {
  shortcuts: Shortcut[];
  canAdd: boolean;
  addShortcut: (input: {
    url: string;
    name?: string;
    iconUrl?: string;
    color?: string;
  }) => Promise<{ error?: string }>;
  updateShortcut: (
    url: string,
    patch: { url?: string; name?: string; iconUrl?: string; color?: string },
  ) => Promise<{ error?: string }>;
  removeShortcut: (url: string) => Promise<void>;
  reorder: (nextUrls: string[]) => Promise<void>;
  importFrom: (
    source: ImportSource,
    items: Array<{ url: string; title?: string }>,
  ) => Promise<{ imported: number; skipped: number }>;
  findDuplicate: (url: string) => string | null;
}

interface UseShortcutsManagerProps {
  topSitesUrls?: string[];
  bookmarks?: BrowserBookmark[];
}

const colorIsValid = (color?: string): color is ShortcutMeta['color'] =>
  !!color &&
  (shortcutColorPalette as readonly string[]).includes(color);

export const useShortcutsManager = (
  { topSitesUrls, bookmarks }: UseShortcutsManagerProps = {},
): UseShortcutsManager => {
  const { logEvent } = useLogContext();
  const { displayToast } = useToastNotification();
  const { customLinks, flags, updateCustomLinks, setSettings } =
    useSettingsContext();
  const { setShowImportSource } = useShortcuts();

  const metaMap = flags?.shortcutMeta ?? {};
  const links = useMemo(() => customLinks ?? [], [customLinks]);

  const shortcuts = useMemo<Shortcut[]>(
    () =>
      links.map((url) => {
        const meta = metaMap[url] ?? {};
        return {
          url,
          name: meta.name,
          iconUrl: meta.iconUrl,
          color: meta.color ?? defaultColorForUrl(url),
        };
      }),
    [links, metaMap],
  );

  const canonicalMap = useMemo(() => {
    const map = new Map<string, string>();
    links.forEach((url) => {
      const key = canonicalShortcutUrl(url);
      if (key) {
        map.set(key, url);
      }
    });
    return map;
  }, [links]);

  const findDuplicate = useCallback(
    (url: string) => {
      const key = canonicalShortcutUrl(url);
      if (!key) {
        return null;
      }
      return canonicalMap.get(key) ?? null;
    },
    [canonicalMap],
  );

  const canAdd = links.length < MAX_SHORTCUTS;

  const log = useCallback(
    (eventName: LogEvent, extra?: Record<string, unknown>) =>
      logEvent({
        event_name: eventName,
        target_type: TargetType.Shortcuts,
        extra: extra ? JSON.stringify(extra) : undefined,
      }),
    [logEvent],
  );

  const writeBatch = useCallback(
    (
      nextLinks: string[],
      nextMeta: Record<string, ShortcutMeta>,
    ): Promise<void> =>
      setSettings({
        customLinks: nextLinks,
        flags: { ...flags, shortcutMeta: nextMeta } as SettingsFlags,
      }) as Promise<void>,
    [flags, setSettings],
  );

  const addShortcut: UseShortcutsManager['addShortcut'] = useCallback(
    async ({ url, name, iconUrl, color }) => {
      if (!canAdd) {
        return { error: `You can only add up to ${MAX_SHORTCUTS} shortcuts.` };
      }
      const httpsUrl = withHttps(url);
      const existingDuplicate = findDuplicate(httpsUrl);
      if (existingDuplicate) {
        return { error: 'This shortcut already exists' };
      }

      const meta: ShortcutMeta = {};
      if (name) {
        meta.name = name;
      }
      if (iconUrl) {
        meta.iconUrl = iconUrl;
      }
      if (colorIsValid(color)) {
        meta.color = color;
      }
      const nextLinks = [...links, httpsUrl];
      const nextMeta = { ...metaMap };
      if (Object.keys(meta).length) {
        nextMeta[httpsUrl] = meta;
      }

      await writeBatch(nextLinks, nextMeta);
      log(LogEvent.AddShortcut);
      return {};
    },
    [canAdd, findDuplicate, links, metaMap, writeBatch, log],
  );

  const updateShortcut: UseShortcutsManager['updateShortcut'] = useCallback(
    async (url, patch) => {
      const index = links.indexOf(url);
      if (index === -1) {
        return { error: 'Shortcut not found' };
      }

      const nextUrl = patch.url ? withHttps(patch.url) : url;
      if (nextUrl !== url) {
        const duplicate = findDuplicate(nextUrl);
        if (duplicate && duplicate !== url) {
          return { error: 'This shortcut already exists' };
        }
      }

      const nextLinks = [...links];
      nextLinks[index] = nextUrl;

      const prevMeta = metaMap[url] ?? {};
      const mergedMeta: ShortcutMeta = {
        ...prevMeta,
        ...(patch.name !== undefined ? { name: patch.name || undefined } : {}),
        ...(patch.iconUrl !== undefined
          ? { iconUrl: patch.iconUrl || undefined }
          : {}),
        ...(patch.color !== undefined && colorIsValid(patch.color)
          ? { color: patch.color }
          : {}),
      };

      const nextMeta = { ...metaMap };
      delete nextMeta[url];
      const isEmpty =
        !mergedMeta.name && !mergedMeta.iconUrl && !mergedMeta.color;
      if (!isEmpty) {
        nextMeta[nextUrl] = mergedMeta;
      }

      await writeBatch(nextLinks, nextMeta);
      log(LogEvent.EditShortcut);
      return {};
    },
    [links, metaMap, findDuplicate, writeBatch, log],
  );

  const undoRef = useRef<{ timeout?: ReturnType<typeof setTimeout> }>({});

  const removeShortcut = useCallback<UseShortcutsManager['removeShortcut']>(
    async (url) => {
      const index = links.indexOf(url);
      if (index === -1) {
        return;
      }
      const prevMeta = metaMap[url];
      const nextLinks = links.filter((u) => u !== url);
      const nextMeta = { ...metaMap };
      delete nextMeta[url];

      await writeBatch(nextLinks, nextMeta);
      log(LogEvent.RemoveShortcut);

      if (undoRef.current.timeout) {
        clearTimeout(undoRef.current.timeout);
      }

      displayToast('Shortcut removed', {
        timer: UNDO_TIMEOUT_MS,
        action: {
          copy: 'Undo',
          onClick: async () => {
            const restoredLinks = [...nextLinks];
            restoredLinks.splice(index, 0, url);
            const restoredMeta = { ...nextMeta };
            if (prevMeta) {
              restoredMeta[url] = prevMeta;
            }
            await writeBatch(restoredLinks, restoredMeta);
            log(LogEvent.UndoRemoveShortcut);
          },
        },
      });
    },
    [links, metaMap, writeBatch, displayToast, log],
  );

  const reorder = useCallback<UseShortcutsManager['reorder']>(
    async (nextUrls) => {
      await updateCustomLinks(nextUrls);
      log(LogEvent.ReorderShortcuts);
    },
    [updateCustomLinks, log],
  );

  const importFrom = useCallback<UseShortcutsManager['importFrom']>(
    async (source, items) => {
      const capacity = MAX_SHORTCUTS - links.length;
      if (capacity <= 0) {
        return { imported: 0, skipped: items.length };
      }

      const existingKeys = new Set(canonicalMap.keys());
      const batchLinks: string[] = [];
      const batchMeta: Record<string, ShortcutMeta> = {};
      let skipped = 0;

      for (const item of items) {
        if (batchLinks.length >= capacity) {
          skipped += 1;
          // eslint-disable-next-line no-continue
          continue;
        }
        const httpsUrl = withHttps(item.url);
        const key = canonicalShortcutUrl(httpsUrl);
        if (!key || existingKeys.has(key)) {
          skipped += 1;
          // eslint-disable-next-line no-continue
          continue;
        }
        existingKeys.add(key);
        batchLinks.push(httpsUrl);
        if (item.title) {
          batchMeta[httpsUrl] = { name: item.title };
        }
      }

      if (!batchLinks.length) {
        setShowImportSource?.(null);
        return { imported: 0, skipped };
      }

      await writeBatch(
        [...links, ...batchLinks],
        { ...metaMap, ...batchMeta },
      );

      const logSource =
        source === 'bookmarks'
          ? ShortcutsSourceType.Bookmarks
          : ShortcutsSourceType.Browser;
      log(LogEvent.ImportShortcuts, {
        source: logSource,
        count: batchLinks.length,
      });

      setShowImportSource?.(null);
      return { imported: batchLinks.length, skipped };
    },
    [canonicalMap, links, metaMap, writeBatch, setShowImportSource, log],
  );

  return {
    shortcuts,
    canAdd,
    addShortcut,
    updateShortcut,
    removeShortcut,
    reorder,
    importFrom,
    findDuplicate,
  };
};

