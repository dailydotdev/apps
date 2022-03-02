import { browser, Runtime } from 'webextension-polyfill-ts';
import { getBootData } from '@dailydotdev/shared/src/lib/boot';
import useUpvotePost from '@dailydotdev/shared/src/hooks/useUpvotePost';
import { apiUrl } from '@dailydotdev/shared/src/lib/config';
import {
  ADD_BOOKMARKS_MUTATION,
  CANCEL_UPVOTE_MUTATION,
  HIDE_POST_MUTATION,
  REMOVE_BOOKMARK_MUTATION,
  REPORT_POST_MUTATION,
  UPVOTE_MUTATION,
} from '@dailydotdev/shared/src/graphql/posts';
import request from 'graphql-request';
import {
  ADD_FILTERS_TO_FEED_MUTATION,
  FEED_FILTERS_FROM_REGISTRATION,
} from '@dailydotdev/shared/src/graphql/feedSettings';
import { UPDATE_USER_SETTINGS_MUTATION } from '@dailydotdev/shared/src/graphql/settings';

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

  const { data, settings } = await getBootData('extension', sender?.tab?.url);
  await browser.tabs.sendMessage(sender?.tab?.id, {
    data,
    settings,
  });
};

function handleMessages(message, sender, response) {
  if (message.type === 'SIGN_CONNECT') {
    sendBootData(message, sender);
    return true;
  }

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

  if (message.type === 'BOOKMARK') {
    request(`${apiUrl}/graphql`, ADD_BOOKMARKS_MUTATION, {
      data: { postIds: [message.post_id] },
    });
  }

  if (message.type === 'REMOVE_BOOKMARK') {
    return request(`${apiUrl}/graphql`, REMOVE_BOOKMARK_MUTATION, {
      id: message.post_id,
    });
  }

  if (message.type === 'REPORT') {
    return request(`${apiUrl}/graphql`, REPORT_POST_MUTATION, {
      id: message.post_id,
      reason: message.reason,
      comment: message.comment,
    });
  }

  if (message.type === 'BLOCK_SOURCE') {
    return request(`${apiUrl}/graphql`, ADD_FILTERS_TO_FEED_MUTATION, {
      filters: {
        excludeSources: [message.source_id],
      },
    });
  }

  if (message.type === 'DISABLE_COMPANION') {
    return request(`${apiUrl}/graphql`, UPDATE_USER_SETTINGS_MUTATION, {
      data: {
        optOutCompanion: true,
      },
    });
    sendBootData(message, sender);
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
