import { browser, Runtime } from 'webextension-polyfill-ts';
import { getBootData } from '@dailydotdev/shared/src/lib/boot';
import useUpvotePost from '@dailydotdev/shared/src/hooks/useUpvotePost';
import { apiUrl } from '@dailydotdev/shared/src/lib/config';
import {
  CANCEL_UPVOTE_MUTATION,
  UPVOTE_MUTATION,
} from '@dailydotdev/shared/src/graphql/posts';
import request from 'graphql-request';

const cacheAmplitudeDeviceId = async ({
  reason,
}: Runtime.OnInstalledDetailsType): Promise<void> => {
  if (reason === 'install') {
    const boot = await getBootData('extension');
    if (boot.visit.ampStorage) {
      localStorage.setItem(
        `amp_${process.env.NEXT_PUBLIC_AMPLITUDE.slice(0, 6)}`,
        boot.visit.ampStorage,
      );
    }
  }
};

const excludedCompanionOrigins = [
  'https://twitter.com',
  'https://www.google.com',
  'chrome-extension://',
];

const isExcluded = (origin: string) =>
  excludedCompanionOrigins.some((e) => origin.includes(e));

const sendBootData = async (request, sender) => {
  if (isExcluded(sender?.origin)) {
    return;
  }

  const boot = await getBootDnvmata('extension', sender?.tab?.url);
  await browser.tabs.sendMessage(sender?.tab?.id, {
    boot,
  });
};

function handleMessages(message, sender, response) {
  if (message.type === 'SIGN_CONNECT') {
    console.log('return boot data');
    sendBootData(message, sender);
    return true;
  }
  console.log(message);

  if (message.type === 'UPVOTE_POST') {
    return request(`${apiUrl}/graphql`, UPVOTE_MUTATION, {
      id: message.post_id,
    });
  }

  if (message.type === 'CANCEL_UPVOTE_POST') {
    return request(`${apiUrl}/graphql`, CANCEL_UPVOTE_MUTATION, {
      id: message.post_id,
    });
  }
}

// @ts-ignore
browser.runtime.onMessage.addListener(handleMessages);

browser.browserAction.onClicked.addListener(() => {
  const url = browser.extension.getURL('index.html?source=button');
  browser.tabs.create({ url, active: true });
});

browser.runtime.onInstalled.addListener(async (details) => {
  await Promise.all([
    cacheAmplitudeDeviceId(details),
    browser.runtime.setUninstallURL('https://daily.dev/uninstall'),
  ]);
});
