import React from 'react';
import { createRoot } from 'react-dom/client';
import '@dailydotdev/shared/src/styles/globals.css';
import { getLocalBootData } from '@dailydotdev/shared/src/contexts/BootProvider';
import type { BootCacheData } from '@dailydotdev/shared/src/lib/boot';
import {
  applyTheme,
  themeModes,
} from '@dailydotdev/shared/src/contexts/SettingsContext';
import { get as getCache } from 'idb-keyval';
import browser from 'webextension-polyfill';
import type { DndSettings } from '@dailydotdev/shared/src/contexts/DndContext';
import {
  FOCUS_SCHEDULE_STORAGE_KEY,
  isFocusActiveAt,
  readFocusSchedule,
  type FocusSchedule,
} from '@dailydotdev/shared/src/features/newTab/store/focusSchedule.store';
import {
  NEW_TAB_MODE_STORAGE_KEY,
  readNewTabMode,
  type NewTabMode,
} from '@dailydotdev/shared/src/features/newTab/store/newTabMode.store';
import App from './App';
import { getDefaultLink } from './dnd';

declare global {
  interface Window {
    windowLoaded: boolean;
  }
}

window.addEventListener(
  'load',
  () => {
    window.windowLoaded = true;
  },
  {
    once: true,
  },
);

const container = document.getElementById('__next');
if (!container) {
  throw new Error('New tab root container is missing');
}
const root = createRoot(container);

const renderApp = (data?: BootCacheData) => {
  root.render(<App localBootData={data} />);
};

const redirectApp = async (url: string) => {
  const tab = await browser.tabs.getCurrent();
  if (!tab.id) {
    throw new Error('Unable to redirect new tab without a tab id');
  }
  window.stop();
  await browser.tabs.update(tab.id, { url });
};

// Read & coerce the DnD setting. Older builds stored `expiration` as a Date
// (idb-keyval preserves it), but a stringified value can sneak in via manual
// edits or older code paths — be defensive so a malformed entry never traps
// the user on a blank page.
const isDndActive = (settings: DndSettings | null | undefined): boolean => {
  if (!settings?.expiration) {
    return false;
  }
  const expirationMs = new Date(settings.expiration).getTime();
  if (Number.isNaN(expirationMs)) {
    return false;
  }
  return expirationMs > Date.now();
};

// Read the user-set Focus configuration. `localStorage` is the canonical
// store written by `useNewTabMode` / `useFocusSchedule` — we read it first
// so a silent `mirrorToExtensionStorage` failure can't strand the redirect.
// `chrome.storage.local` is a fallback for the rare case where localStorage
// is unavailable (e.g. site data cleared but extension data preserved).
const resolveScheduledFocus = async (): Promise<boolean> => {
  try {
    const localMode = readNewTabMode();
    const localSchedule = readFocusSchedule();
    if (localMode === 'focus') {
      return isFocusActiveAt(localSchedule);
    }
    // localStorage said `discover`, but check the extension mirror in case
    // the page just opened and `localStorage` was cleared by the user
    // outside of our flow.
    const stored = await browser.storage.local.get([
      FOCUS_SCHEDULE_STORAGE_KEY,
      NEW_TAB_MODE_STORAGE_KEY,
    ]);
    const mirroredMode = stored[NEW_TAB_MODE_STORAGE_KEY] as
      | NewTabMode
      | undefined;
    const mirroredSchedule = stored[FOCUS_SCHEDULE_STORAGE_KEY] as
      | FocusSchedule
      | undefined;
    if (mirroredMode !== 'focus' || !mirroredSchedule) {
      return false;
    }
    return isFocusActiveAt(mirroredSchedule);
  } catch {
    return false;
  }
};

(async () => {
  const data = getLocalBootData();

  if (data?.settings?.theme) {
    applyTheme(themeModes[data.settings.theme]);
  }

  // Always render the app on any unexpected failure below — a blank new tab
  // is the worst possible outcome, much worse than a missed redirect.
  try {
    const source = window.location.href.split('source=')[1];
    if (source) {
      renderApp(data ?? undefined);
      return;
    }

    const dnd = await getCache<DndSettings>('dnd').catch(() => null);
    if (isDndActive(dnd) && dnd) {
      await redirectApp(dnd.link);
      return;
    }

    if (await resolveScheduledFocus()) {
      await redirectApp(getDefaultLink());
      return;
    }

    renderApp(data ?? undefined);
  } catch {
    renderApp(data ?? undefined);
  }
})();
