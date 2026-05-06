import React from 'react';
import { createRoot } from 'react-dom/client';
import '@dailydotdev/shared/src/styles/globals.css';
import { getLocalBootData } from '@dailydotdev/shared/src/contexts/BootProvider';
import type { BootCacheData } from '@dailydotdev/shared/src/lib/boot';
import {
  applyTheme,
  themeModes,
} from '@dailydotdev/shared/src/contexts/SettingsContext';
import { get as getCache, set as setCache } from 'idb-keyval';
import browser from 'webextension-polyfill';
import type { DndSettings } from '@dailydotdev/shared/src/contexts/DndContext';
import { featureExtensionInHouseDnd } from '@dailydotdev/shared/src/lib/featureManagement';
import { evaluateFeatureFromBoot } from '@dailydotdev/shared/src/lib/evaluateFeatureFromBoot';
import { BootApp } from '@dailydotdev/shared/src/lib/boot';
import { version } from '../../package.json';
import App from './App';
import InHouseDndPage from './InHouseDndPage';

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

const rootElement = document.getElementById('__next');
if (!rootElement) {
  throw new Error('Missing new tab root element');
}

const root = createRoot(rootElement);

const renderApp = (data?: BootCacheData | null) => {
  root.render(<App localBootData={data ?? undefined} />);
};

const renderDndApp = (data?: BootCacheData | null) => {
  const onExit = async () => {
    await setCache('dnd', null);
    renderApp(data);
  };

  root.render(<InHouseDndPage onExit={onExit} />);
};

const redirectApp = async (url: string) => {
  const tab = await browser.tabs.getCurrent();
  if (tab.id == null) {
    throw new Error('Cannot redirect Do Not Disturb tab without a tab id');
  }

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

  const dnd = await getCache<DndSettings | null>('dnd');
  if (!dnd || dnd.expiration.getTime() <= new Date().getTime()) {
    return renderApp(data);
  }

  const isInHouseDnd = await evaluateFeatureFromBoot({
    bootData: data,
    feature: featureExtensionInHouseDnd,
    app: BootApp.Extension,
    version,
  });

  return isInHouseDnd ? renderDndApp(data) : redirectApp(dnd.link);
})();
