import React from 'react';
import ReactDOM from 'react-dom';
import { browser } from 'webextension-polyfill-ts';
import { CompanionBootData } from './common';
import App from './App';

const init = async (boot: CompanionBootData) => {
  const { postCanonical } = boot;

  // Inject app div
  const appContainer = document.createElement('daily-companion-app');
  document.body.appendChild(appContainer);

  // Create shadow dom
  const shadow = document
    .querySelector('daily-companion-app')
    .attachShadow({ mode: 'open' });

  const style = document.createElement('style');
  style.type = 'text/css';
  style.innerHTML =
    '@import "chrome-extension://dhhaojmcngfjmoinjljlkdknbcildjlg/css/companion.css";';
  shadow.appendChild(style);

  // Set target of the React app to shadow dom
  ReactDOM.render(
    <App postData={{ ...postCanonical }} />,
    document.querySelector('daily-companion-app').shadowRoot,
  );
};

browser.runtime.onMessage.addListener(async (request) => {
  const { boot } = request;
  init(boot);
});
