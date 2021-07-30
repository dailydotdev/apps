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

const renderApp = () => {
  ReactDOM.render(<App />, document.getElementById('__next'));
};

const redirectApp = async (url: string) => {
  const tab = await browser.tabs.getCurrent();
  window.stop();
  await browser.tabs.update(tab.id, { url });
};

(async () => {
  const source = window.location.href.split('source=')[1];

  if (source) return renderApp();

  const dnd = await getCache<DndSettings>('dnd');
  const isDnd = dnd?.expiration?.getTime() > new Date().getTime();

  return isDnd ? redirectApp(dnd.link) : renderApp();
})();
