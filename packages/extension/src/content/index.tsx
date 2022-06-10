import { browser } from 'webextension-polyfill-ts';
import { removeLinkTargetElement } from '@dailydotdev/shared/src/lib/strings';

const isRendered = !!document.querySelector('daily-companion-app');

if (!isRendered) {
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

  let lastUrl = removeLinkTargetElement(window.location.href);
  new MutationObserver(() => {
    const current = removeLinkTargetElement(window.location.href);
    if (current !== lastUrl) {
      lastUrl = current;
      browser.runtime.sendMessage({ type: 'CONTENT_LOADED' });
    }
  }).observe(document, { subtree: true, childList: true });
}
