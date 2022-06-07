import { browser } from 'webextension-polyfill-ts';

// Inject app div
const appContainer = document.createElement('daily-companion-app');
document.body.appendChild(appContainer);

// Create shadow dom
const shadow = document
  .querySelector('daily-companion-app')
  .attachShadow({ mode: 'open' });

const wrapper = document.createElement('div');
wrapper.id = 'daily-companion-wrapper';
shadow.appendChild(wrapper);

browser.runtime.sendMessage({ type: 'CONTENT_LOADED' });

let lastUrl = window.location.href;
new MutationObserver(() => {
  const current = window.location.href;
  if (current !== lastUrl) {
    lastUrl = current;
    browser.runtime.sendMessage({ type: 'CONTENT_LOADED' });
  }
}).observe(document, { subtree: true, childList: true });
