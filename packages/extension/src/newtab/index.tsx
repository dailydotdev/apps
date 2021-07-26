import React from 'react';
import ReactDOM from 'react-dom';
import '@dailydotdev/shared/src/styles/globals.css';
import { get as getCache } from 'idb-keyval';
import { browser } from 'webextension-polyfill-ts';
import App from './App';
import { DndSettings } from './DndContext';

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

(async () => {
  const source = window.location.href.split('source=')[1];
  if (!source) {
    const dnd = await getCache<DndSettings>('dnd');
    const isDnd = dnd?.expiration?.getTime() > new Date().getTime();
    if (isDnd) {
      const tab = await browser.tabs.getCurrent();
      const url =
        process.env.TARGET_BROWSER === 'chrome'
          ? 'chrome-search://local-ntp/local-ntp.html'
          : 'https://www.google.com';
      window.stop();
      await browser.tabs.update(tab.id, { url });
      return;
    }
  }
  ReactDOM.render(<App />, document.getElementById('__next'));
})();
