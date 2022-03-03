import React from 'react';
import ReactDOM from 'react-dom';
import { browser } from 'webextension-polyfill-ts';
import { CompanionBootData } from './common';
import App from './App';

const init = async (data: CompanionBootData, optOutCompanion: boolean) => {
  const { postCanonical } = data;

  // Set target of the React app to shadow dom
  ReactDOM.render(
    <App postData={{ ...postCanonical }} optOutCompanion={optOutCompanion} />,
    document
      .querySelector('daily-companion-app')
      .shadowRoot.querySelector('#daily-companion-wrapper'),
  );
};

browser.runtime.onMessage.addListener(async (request) => {
  const { data, settings } = request;
  init(data, settings.optOutCompanion);
});
