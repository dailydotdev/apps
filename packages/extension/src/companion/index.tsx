import React, { ReactElement } from 'react';
import ReactDOM from 'react-dom';

import '@dailydotdev/shared/src/styles/globals.css';
import { browser } from 'webextension-polyfill-ts';
import App from '../companion/App';

browser.runtime.onMessage.addListener(async (request, sender) => {
  const { boot } = request;
  console.log('boot: ', boot);
  init(boot);
});

const init = async (boot) => {
  const { postCanonical } = boot;
  ReactDOM.render(
    <App postData={postCanonical} />,
    document.getElementById('__next'),
  );
};
