import { useEffect, useRef, useState } from 'react';
import browser from 'webextension-polyfill';
import { useMessagePopupObserver } from './useMessagePopupObserver';

export const useThreadPageObserver = () => {
  const [id, setId] = useState<string>(null);
  const threadFinder = useRef<NodeJS.Timeout>(null);

  useMessagePopupObserver({ id, container: document });

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
