// Must be the first import
import { DndSettings } from './DndContext';

if (process.env.NODE_ENV === 'development') {
  // Must use require here as import statements are only allowed
  // to exist at top-level.
  require('preact/debug');
}

import React from 'react';
import ReactDOM from 'react-dom';
import '@dailydotdev/shared/src/styles/globals.css';
import { get as getCache } from 'idb-keyval';
import App from './App';
import { browser } from 'webextension-polyfill-ts';

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

const renderApp = () => {
  ReactDOM.render(<App />, document.getElementById('__next'));
};

(async () => {
  const source = window.location.href.split('source=')[1];

  if (source) return renderApp();

  const dnd = await getCache<DndSettings>('dnd');
  const isDnd = dnd?.expiration?.getTime() > new Date().getTime();

  if (!isDnd) return renderApp();

  const tab = await browser.tabs.getCurrent();
  window.stop();
  await browser.tabs.update(tab.id, { url: dnd.link });
})();
