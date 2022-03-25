import React from 'react';
import ReactDOM from 'react-dom';
import { browser } from 'webextension-polyfill-ts';
import { themeModes } from '@dailydotdev/shared/src/contexts/SettingsContext';
import { getCompanionWrapper } from './common';
import App, { CompanionData } from './App';

const renderApp = ({ postData, settings }: CompanionData) => {
  getCompanionWrapper().classList.add(themeModes[settings.theme]);

  // Set target of the React app to shadow dom
  ReactDOM.render(
    <App postData={postData} settings={settings} />,
    getCompanionWrapper(),
  );
};

browser.runtime.onMessage.addListener(async (request) => {
  const { postData, settings }: CompanionData = request;
  if (postData && !settings.optOutCompanion) {
    renderApp({ postData, settings });
  }
});
