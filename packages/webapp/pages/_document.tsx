import type { ReactElement } from 'react';
import React from 'react';
import type { DocumentProps } from 'next/document';
import { Html, Head, Main, NextScript } from 'next/document';

const CHATGPT_EMBED_PAGES = ['/embed/chatgpt/post'];

const Document = ({ __NEXT_DATA__ }: DocumentProps): ReactElement => (
  <Html>
    <Head>
      {CHATGPT_EMBED_PAGES.includes(__NEXT_DATA__.page) && (
        // eslint-disable-next-line @next/next/no-sync-scripts
        <script src="/embed/chatgpt/bootstrap.js" />
      )}
    </Head>
    <body>
      <Main />
      <NextScript />
    </body>
  </Html>
);

export default Document;
