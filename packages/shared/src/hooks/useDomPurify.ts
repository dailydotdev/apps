import { useState } from 'react';
import createDOMPurify from 'dompurify';

export const useDomPurify = (): DOMPurify.DOMPurifyI => {
  const [purify] = useState(createDOMPurify(globalThis.window));

  return purify;
};
