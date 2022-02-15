import '@dailydotdev/shared/src/styles/globals.css';
import { browser } from 'webextension-polyfill-ts';

browser.runtime.onMessage.addListener(async (request, sender) => {
  init();
});

const init = async () => {
  const iFrame = document.createElement('iframe');
  Object.assign(iFrame.style, {
    position: 'fixed',
    top: '0px',
    right: '0px',
    height: '100vh',
    zIndex: '999',
  });
  iFrame.setAttribute('src', browser.extension.getURL('companion.html'));
  document.body.appendChild(iFrame);
};
