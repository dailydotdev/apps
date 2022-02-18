import '@dailydotdev/shared/src/styles/globals.css';
import { browser } from 'webextension-polyfill-ts';

const iFrame = document.createElement('iframe');
iFrame.setAttribute('src', browser.extension.getURL('companion.html'));
iFrame.style.display = 'none';
document.body.appendChild(iFrame);

const init = async () => {
  Object.assign(iFrame.style, {
    position: 'fixed',
    top: '0px',
    right: '0px',
    height: '100vh',
    zIndex: '999',
    display: 'block',
    width: '415px',
  });
};

browser.runtime.onMessage.addListener(async () => {
  init();
});
