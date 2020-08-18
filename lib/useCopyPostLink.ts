import { useState } from 'react';
import ReactGA from 'react-ga';

export function useCopyPostLink(): [boolean, () => Promise<void>] {
  const [copying, setCopying] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopying(true);
    ReactGA.event({
      category: 'Post',
      action: 'Share',
      label: 'Copy',
    });
    setTimeout(() => {
      setCopying(false);
    }, 1000);
  };

  return [copying, copy];
}
