import { useState } from 'react';

export function useCopyLink(
  getLink: () => string,
): [boolean, () => Promise<void>] {
  const [copying, setCopying] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(getLink());
    setCopying(true);
    setTimeout(() => {
      setCopying(false);
    }, 1000);
  };

  return [copying, copy];
}
