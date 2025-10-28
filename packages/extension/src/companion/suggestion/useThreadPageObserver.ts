import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { USER_REFERRAL_RECRUITER_QUERY } from '@dailydotdev/shared/src/graphql/users';
import { useToastNotification } from '@dailydotdev/shared/src/hooks';
import { useBackgroundRequest } from '@dailydotdev/shared/src/hooks/companion';
import { useRequestProtocol } from '@dailydotdev/shared/src/hooks/useRequestProtocol';
import {
  generateQueryKey,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import browser from 'webextension-polyfill';
import { generateReplySuggestion } from './common';

const quickRepliesClass = 'msg-s-message-list__quick-replies-container';

export const useThreadPageObserver = () => {
  const [id, setId] = useState<string>(null);
  const { user } = useAuthContext();
  const queryKey = generateQueryKey(RequestKey.InviteRecruiter, user, id);
  const { displayToast } = useToastNotification();
  useBackgroundRequest(queryKey, {
    enabled: !!id,
    callback: async ({ res }) => {
      const { cta, message } = res.userReferralRecruiter;

      await new Promise((resolve) => setTimeout(resolve, 1000)); // wait for the dom to load

      const quickReplies = document.querySelector(`.${quickRepliesClass}`);

      if (!quickReplies) {
        return;
      }

      generateReplySuggestion({
        cta,
        onClick: () => {
          navigator.clipboard.writeText(message);
          displayToast('Referral message copied to clipboard!');
        },
      });
    },
  });

  const { requestMethod } = useRequestProtocol();
  useQuery({
    queryKey,
    queryFn: () =>
      requestMethod(
        USER_REFERRAL_RECRUITER_QUERY,
        { toReferExternalId: id },
        { requestKey: JSON.stringify(queryKey) },
      ),
    enabled: !!id,
  });

  const threadFinder = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    // on load check if we're in a thread view
    const url = window.location.href;

    if (!url.includes('/messaging/thread/')) {
      return undefined;
    }

    threadFinder.current = setInterval(() => {
      const anchor = document.querySelector('.msg-thread__link-to-profile');

      if (!anchor) {
        return;
      }

      const href = anchor.getAttribute('href');
      const uniqueId = href.split('/in/')[1];

      setId(uniqueId);
      clearInterval(threadFinder.current);
    }, 1000);

    return () => {
      if (threadFinder.current) {
        clearInterval(threadFinder.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleUrlUpdate = ({ url }: { url: string }) => {
      if (!url || !url.includes('/messaging/thread/')) {
        return;
      }

      const anchor = document.querySelector('.msg-thread__link-to-profile');
      const href = anchor.getAttribute('href');
      const uniqueId = href.split('/in/')[1];

      if (uniqueId === id) {
        return;
      }

      setId(uniqueId);
    };

    browser.runtime.onMessage.addListener(handleUrlUpdate);

    return () => {
      browser.runtime.onMessage.removeListener(handleUrlUpdate);
    };
  }, [id]);
};
