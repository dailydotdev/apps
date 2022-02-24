import React from 'react';
import ReactDOM from 'react-dom';
import { browser } from 'webextension-polyfill-ts';
import { CompanionBootData } from './common';
import App from './App';

const init = async (boot: CompanionBootData) => {
  const { postCanonical } = boot;

  // Set target of the React app to shadow dom
  ReactDOM.render(
    <App postData={{ ...postCanonical }} />,
    document
      .querySelector('daily-companion-app')
      .shadowRoot.querySelector('#daily-companion-wrapper'),
  );
};

browser.runtime.onMessage.addListener(async (request) => {
  const { boot } = request;
  init(boot);
});
