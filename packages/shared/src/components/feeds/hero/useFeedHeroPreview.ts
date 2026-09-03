import { useEffect, useState } from 'react';

const STORAGE_KEY = 'feed_hero_preview';

const readStored = (): boolean => {
  try {
    return globalThis.localStorage?.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
};

const store = (enabled: boolean): void => {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, enabled ? '1' : '0');
  } catch {
    // Private windows and blocked site data: the switch just won't stick.
  }
};

/**
 * Temporary review switch: `?feed_hero=1` turns the hero on for this browser,
 * `?feed_hero=0` turns it back off. A preview deploy is a production build, so
 * GrowthBook devtools can't force the flag there. Remove this once `feed_hero`
 * is configured in GrowthBook — a URL that opts someone into an experiment arm
 * would skew the allocation.
 */
export const useFeedHeroPreview = (): boolean => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const param = new URLSearchParams(globalThis.location?.search).get(
      'feed_hero',
    );

    if (param === null) {
      setEnabled(readStored());
      return;
    }

    const next = param !== '0' && param !== 'false';
    store(next);
    setEnabled(next);
  }, []);

  return enabled;
};
