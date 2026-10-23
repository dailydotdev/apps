import type { ReactElement } from 'react';
import React from 'react';
import { Html, Head, Main, NextScript } from 'next/document';
import { shellPrepaintScript } from '@dailydotdev/shared/src/lib/shellPrepaint';

const Document = (): ReactElement => (
  <Html>
    <Head>
      {/* eslint-disable-next-line react/no-danger */}
      <script dangerouslySetInnerHTML={{ __html: shellPrepaintScript }} />
    </Head>
    <body>
      <Main />
      <NextScript />
    </body>
  </Html>
);

export default Document;
