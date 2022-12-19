import { useEffect, useState } from 'react';
import createDOMPurify from 'dompurify';

export const useDomPurify = (): DOMPurify.DOMPurifyI => {
  const [purify, setPurify] = useState<DOMPurify.DOMPurifyI>();

  useEffect(() => {
    setPurify(createDOMPurify(globalThis.window));
  }, []);

  return purify;
};
