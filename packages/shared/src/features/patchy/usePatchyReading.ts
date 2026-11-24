import { useEffect, useState } from 'react';
import { subscribePatchyEvents } from './patchyEvents';

const CHECK_EVERY_MS = 1000;

export const isPatchyPostOpen = (): boolean =>
  !!document.querySelector('.post-modal-overlay') ||
  window.location.pathname.startsWith('/posts/');

// Whether a post is open, so he can read along with you (newspaper up). A
// post opening starts it right away; the page is also checked as he starts
// and every second after, since a post opened directly (or before he loaded)
// sends its event before he listens. It ends once no post modal or page is
// left. Separate from the suggestions, so he still reads along with them off
// and on the phone, where he makes none.
export const usePatchyReading = (isEnabled: boolean): boolean => {
  const [isReading, setIsReading] = useState(false);

  useEffect(() => {
    if (!isEnabled) {
      setIsReading(false);
      return undefined;
    }
    setIsReading(isPatchyPostOpen());
    const unsubscribe = subscribePatchyEvents((event) => {
      if (event.type === 'post_open') {
        setIsReading(true);
      }
    });
    const id = setInterval(
      () => setIsReading(isPatchyPostOpen()),
      CHECK_EVERY_MS,
    );
    return () => {
      unsubscribe();
      clearInterval(id);
    };
  }, [isEnabled]);

  return isEnabled && isReading;
};
