import React from 'react';
import ReactDOM from 'react-dom';
import { browser } from 'webextension-polyfill-ts';
import { themeModes } from '@dailydotdev/shared/src/contexts/SettingsContext';
import { CompanionBootData } from './common';
import App from './App';

const init = async (data: CompanionBootData, settings) => {
  const { postByUrl } = data.data;

  document
    .querySelector('daily-companion-app')
    .shadowRoot.querySelector('#daily-companion-wrapper')
    .classList.add(themeModes[settings.theme]);

  // Set target of the React app to shadow dom
  ReactDOM.render(
    <App postData={{ ...postByUrl }} settings={settings} />,
    document
      .querySelector('daily-companion-app')
      .shadowRoot.querySelector('#daily-companion-wrapper'),
  );
};

browser.runtime.onMessage.addListener(async (request) => {
  const { data, settings } = request;
  if (data !== null && data?.data !== null) {
    init(data, settings);
  }
});
