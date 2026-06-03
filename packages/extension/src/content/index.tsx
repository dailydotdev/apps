import browser from 'webextension-polyfill';
import { removeLinkTargetElement } from '@dailydotdev/shared/src/lib/strings';
import { ExtensionMessageType } from '@dailydotdev/shared/src/lib/extension';

// Keep the companion out of embedded article/reader iframes so our injected
// host element and CSS can never alter the page being previewed.
if (window.top === window.self) {
  const isRendered = !!document.querySelector('daily-companion-app');

  if (!isRendered) {
    // Inject app div
    const appContainer = document.createElement('daily-companion-app');
    document.body.appendChild(appContainer);

    // Create shadow dom
    const shadow = appContainer.attachShadow({ mode: 'open' });

    const wrapper = document.createElement('div');
    wrapper.id = 'daily-companion-wrapper';
    shadow.appendChild(wrapper);

    browser.runtime.sendMessage({ type: ExtensionMessageType.ContentLoaded });

    let lastUrl = removeLinkTargetElement(window.location.href);
    new MutationObserver(() => {
      const current = removeLinkTargetElement(window.location.href);
      if (current !== lastUrl) {
        lastUrl = current;
        browser.runtime.sendMessage({
          type: ExtensionMessageType.ContentLoaded,
        });
      }
    }).observe(document, { subtree: true, childList: true });
  }
}
