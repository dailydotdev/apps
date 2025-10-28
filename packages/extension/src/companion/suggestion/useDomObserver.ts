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

const containerClass = 'msg-s-message-list-content';
const quickRepliesClass = 'msg-s-message-list__quick-replies-container';

export const useDomObserver = () => {
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

      const parent = document.querySelector(`.${containerClass}`);
      const container = document.createElement('div');
      container.style =
        'display: flex; justify-content: center; margin-bottom: 8px;';
      const constructed = document.createElement('button');
      constructed.setAttribute(
        'class',
        'conversations-quick-replies__reply-button artdeco-button artdeco-button--2 artdeco-button--secondary',
      );
      constructed.style.marginLeft = 'auto';
      constructed.style.marginRight = 'auto';
      constructed.innerText = cta;
      constructed.onclick = () => {
        navigator.clipboard.writeText(message);
        displayToast('Referral message copied to clipboard!');
      };

      if (!parent) {
        return;
      }

      container.appendChild(constructed);
      parent.appendChild(container);
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
