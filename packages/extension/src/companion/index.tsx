import React from 'react';
import ReactDOM from 'react-dom';

import '@dailydotdev/shared/src/styles/globals.css';
import { browser } from 'webextension-polyfill-ts';
import App from './App';
import { CompanionBootData } from './common';

const init = async (boot: CompanionBootData) => {
  const { postCanonical } = boot;
  ReactDOM.render(
    <App postData={postCanonical} />,
    document.getElementById('__next'),
  );
};

browser.runtime.onMessage.addListener(async (request) => {
  const { boot } = request;
  init(boot);
});
