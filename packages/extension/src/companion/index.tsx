import React from 'react';
import ReactDOM from 'react-dom';
import { browser } from 'webextension-polyfill-ts';
import { themeModes } from '@dailydotdev/shared/src/contexts/SettingsContext';
import { getCompanionWrapper } from './common';
import App, { CompanionData } from './App';

const renderApp = ({ ...props }: CompanionData) => {
  const { settings } = props;
  getCompanionWrapper().classList.add(themeModes[settings.theme]);

  // Set target of the React app to shadow dom
  ReactDOM.render(<App {...props} />, getCompanionWrapper());
};

browser.runtime.onMessage.addListener(
  ({ deviceId, url, postData, settings, flags, user, alerts, visit }) => {
    if (postData && !settings.optOutCompanion) {
      renderApp({
        deviceId,
        url,
        postData,
        settings,
        flags,
        user,
        alerts,
        visit,
      });
    }
  },
);
