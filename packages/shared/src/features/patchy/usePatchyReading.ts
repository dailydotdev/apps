import { useEffect, useState } from 'react';
import { subscribePatchyEvents } from './patchyEvents';

const CHECK_EVERY_MS = 1000;

export const isPatchyPostOpen = (): boolean =>
  !!document.querySelector('.post-modal-overlay') ||
  window.location.pathname.startsWith('/posts/');

// Whether a post is open, so he can read along with you (newspaper up). It
// starts when a post opens and ends once no post modal or page is left.
// Separate from the suggestions, so he still reads along with them off and
// on the phone, where he makes none.
export const usePatchyReading = (isEnabled: boolean): boolean => {
  const [isReading, setIsReading] = useState(false);

  useEffect(() => {
    if (!isEnabled) {
      setIsReading(false);
      return undefined;
    }
    return subscribePatchyEvents((event) => {
      if (event.type === 'post_open') {
        setIsReading(true);
      }
    });
  }, [isEnabled]);

  useEffect(() => {
    if (!isReading) {
      return undefined;
    }
    const id = setInterval(() => {
      if (!isPatchyPostOpen()) {
        setIsReading(false);
      }
    }, CHECK_EVERY_MS);
    return () => clearInterval(id);
  }, [isReading]);

  return isEnabled && isReading;
};
