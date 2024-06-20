import '@dailydotdev/shared/src/lib/lazysizesImport';
import React from 'react';
import { createRoot } from 'react-dom/client';
import '@dailydotdev/shared/src/styles/globals.css';
import { getLocalBootData } from '@dailydotdev/shared/src/contexts/BootProvider';
import { BootCacheData } from '@dailydotdev/shared/src/lib/boot';
import {
  applyTheme,
  themeModes,
} from '@dailydotdev/shared/src/contexts/SettingsContext';
import { get as getCache } from 'idb-keyval';
import browser from 'webextension-polyfill';
import { DndSettings } from '@dailydotdev/shared/src/contexts/DndContext';
import App from './App';

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

const root = createRoot(document.getElementById('__next'));

const renderApp = (data?: BootCacheData) => {
  root.render(<App localBootData={data} />);
};

const redirectApp = async (url: string) => {
  const tab = await browser.tabs.getCurrent();
  window.stop();
  await browser.tabs.update(tab.id, { url });
};

(async () => {
  const data = getLocalBootData();

  if (data?.settings?.theme) {
    applyTheme(themeModes[data.settings.theme]);
  }

  const source = window.location.href.split('source=')[1];

  if (source) {
    return renderApp(data);
  }

  const dnd = await getCache<DndSettings>('dnd');
  const isDnd = dnd?.expiration?.getTime() > new Date().getTime();

  return isDnd ? redirectApp(dnd.link) : renderApp(data);
})();
