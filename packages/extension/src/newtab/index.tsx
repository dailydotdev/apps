// Must be the first import
if (process.env.NODE_ENV === 'development') {
  // Must use require here as import statements are only allowed
  // to exist at top-level.
  require('preact/debug');
}

import React from 'react';
import ReactDOM from 'react-dom';
import '@dailydotdev/shared/src/styles/globals.css';
import App from './App';

declare global {
  interface Window {
    windowLoaded: boolean;
  }
}

window.addEventListener(
  'load',
  () => {
    window.windowLoaded = true;
  },
  {
    once: true,
  },
);

ReactDOM.render(<App />, document.getElementById('__next'));
