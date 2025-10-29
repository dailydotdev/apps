import { ONE_SECOND, sleep } from '@dailydotdev/shared/src/lib/func';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import browser from 'webextension-polyfill';

export const useThreadPageObserver = () => {
  const [id, setId] = useState<string>(null);

  useQuery({
    queryKey: ['thread-page'],
    queryFn: () => null,
    refetchInterval: (cache) => {
      const url = window.location.href;

      if (!url.includes('/messaging/thread/')) {
        return false;
      }

      const retries = cache.state.dataUpdateCount;

      if (retries >= 3) {
        return false;
      }

      const anchor = document.querySelector('.msg-thread__link-to-profile');

      if (!anchor) {
        return ONE_SECOND;
      }

      const href = anchor.getAttribute('href');
      const uniqueId = href.split('/in/')[1];

      setId(uniqueId);

      return false;
    },
  });

  useEffect(() => {
    const handleUrlUpdate = async ({ url }: { url: string }) => {
      if (!url || !url.includes('/messaging/thread/')) {
        return;
      }

      await sleep(ONE_SECOND * 2); // wait for the dom to update
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

  return { id };
};
