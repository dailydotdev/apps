import React from 'react';
import ReactDOM from 'react-dom';
import { browser } from 'webextension-polyfill-ts';
import {
  applyTheme,
  themeModes,
} from '@dailydotdev/shared/src/contexts/SettingsContext';
import { getCompanionWrapper } from './common';
import App, { CompanionData } from './App';

const renderApp = (props: CompanionData) => {
  const container = getCompanionWrapper();
  applyTheme(themeModes[props.settings.theme]);

  // Set target of the React app to shadow dom
  ReactDOM.render(<App {...props} />, container);
};

browser.runtime.onMessage.addListener(
  ({
    deviceId,
    url,
    postData,
    settings,
    flags,
    user,
    alerts,
    visit,
    accessToken,
  }) => {
    if (settings.optOutCompanion) {
      return;
    }

    if (postData) {
      renderApp({
        deviceId,
        url,
        postData,
        settings,
        flags,
        user,
        alerts,
        visit,
        accessToken,
      });
    } else {
      const container = getCompanionWrapper();
      if (container) {
        ReactDOM.unmountComponentAtNode(container);
      }
    }
  },
);
