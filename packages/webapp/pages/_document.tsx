import type { ReactElement } from 'react';
import React from 'react';
import { Html, Head, Main, NextScript } from 'next/document';

// Browser auto-translation (Google Translate, Edge translate) wraps text nodes
// in <font> tags, which causes React to throw "insertBefore: node is not a child"
// and "removeChild: node is not a child" during reconciliation. Opt out at the
// document level so React's DOM stays untouched.
const Document = (): ReactElement => (
  <Html translate="no">
    <Head>
      <meta name="google" content="notranslate" />
    </Head>
    <body>
      <Main />
      <NextScript />
    </body>
  </Html>
);

export default Document;
