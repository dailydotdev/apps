import browser from 'webextension-polyfill';
import {
  CreateRequestContentScripts,
  contentScriptKey,
} from '@dailydotdev/shared/src/hooks';
import { companionPermissionGrantedLink } from '@dailydotdev/shared/src/lib/constants';
import { AnalyticsEvent } from '@dailydotdev/shared/src/lib/analytics';

export const HOST_PERMISSIONS = [
  'https://daily.dev/*',
  'https://*.daily.dev/*',
  'https://dailynow.co/*',
  'https://*.dailynow.co/*',
];

let hasInjectedScripts = false;

export const registerBrowserContentScripts = async (): Promise<void> => {
  if (hasInjectedScripts) {
    return null;
  }

  await browser.scripting.registerContentScripts([
    {
      id: `companion-${Date.now()}`,
      matches: ['*://*/*'],
      css: ['css/daily-companion-app.css'],
      js: ['js/content.bundle.js', 'js/companion.bundle.js'],
    },
  ]);

  hasInjectedScripts = true;

  return null;
};

export const getContentScriptPermission = (): Promise<boolean> =>
  browser.permissions.contains({
    origins: ['*://*/*'],
  });

export const getContentScriptPermissionAndRegister =
  async (): Promise<void> => {
    const permission = await getContentScriptPermission();

    if (permission && !hasInjectedScripts) {
      await registerBrowserContentScripts();
      hasInjectedScripts = true;
    }
  };

export const requestContentScripts: CreateRequestContentScripts = (
  client,
  trackEvent,
) => {
  return async ({
    origin,
    skipRedirect,
  }: {
    origin: string;
    skipRedirect?: boolean;
  }) => {
    trackEvent({
      event_name: AnalyticsEvent.RequestContentScripts,
      extra: JSON.stringify({ origin }),
    });

    const granted = await browser.permissions.request({
      origins: ['*://*/*'],
    });

    if (granted) {
      trackEvent({
        event_name: AnalyticsEvent.ApproveContentScripts,
        extra: JSON.stringify({ origin }),
      });
      client.setQueryData(contentScriptKey, true);
      await registerBrowserContentScripts();

      if (!skipRedirect) {
        window.open(companionPermissionGrantedLink, '_blank');
      }
    } else {
      trackEvent({
        event_name: AnalyticsEvent.DeclineContentScripts,
        extra: JSON.stringify({ origin }),
      });
    }

    return granted;
  };
};

export const getHostPermission = (): Promise<boolean> =>
  browser.permissions.contains({
    origins: HOST_PERMISSIONS,
  });

export const getHostPermissionAndRegister = async (): Promise<void> => {
  const permission = await getHostPermission();

  // // Create a new button element
  // const button = document.createElement('button');
  // button.id = 'myButton';
  // button.style.display = 'none'; // Hide the button
  //
  // // Append the button to the body
  // document.body.appendChild(button);
  //
  // // Create a click event
  // const event = new MouseEvent('click', {
  //   bubbles: true,
  //   cancelable: true,
  //   view: window,
  // });
  //
  // button.addEventListener('click', async () => {
  //
  // });
  //
  // console.log({ button });
  //
  // // Dispatch the event
  // button.dispatchEvent(event);
  //
  // // Remove the button after the click
  // document.body.removeChild(button);

  if (!permission) {
    await browser.permissions.request({ origins: HOST_PERMISSIONS });
  }
};
