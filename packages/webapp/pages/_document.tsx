import type { ReactElement } from 'react';
import React from 'react';
import { Html, Head, Main, NextScript } from 'next/document';
import { BOOT_LOCAL_KEY } from '@dailydotdev/shared/src/contexts/common';

// The server cannot know who is visiting, so anonymous-only slots ship in the
// HTML and would collapse once the cached boot reveals a member. Flag a cached
// member on the root before first paint so those slots never render for them.
export const cachedUserClassName = 'cached-user';

const cachedUserScript = `try{var b=JSON.parse(localStorage.getItem(${JSON.stringify(
  BOOT_LOCAL_KEY,
)}));if(b&&b.user&&b.user.providers){document.documentElement.classList.add(${JSON.stringify(
  cachedUserClassName,
)})}}catch(e){}`;

// Browser auto-translation (Google Translate, Edge translate) wraps text nodes
// in <font> tags, which causes React to throw "insertBefore: node is not a child"
// and "removeChild: node is not a child" during reconciliation. Opt out at the
// document level so React's DOM stays untouched.
const Document = (): ReactElement => (
  <Html translate="no">
    <Head>
      <meta name="google" content="notranslate" />
      {/* eslint-disable-next-line react/no-danger */}
      <script dangerouslySetInnerHTML={{ __html: cachedUserScript }} />
    </Head>
    <body>
      <Main />
      <NextScript />
    </body>
  </Html>
);

export default Document;
