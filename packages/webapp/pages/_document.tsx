import type { ReactElement } from 'react';
import React from 'react';
import { Html, Head, Main, NextScript } from 'next/document';
import { mobileAppHeaderHintScript } from '@dailydotdev/shared/src/features/getApp/mobileAppHeaderHint';

const Document = (): ReactElement => (
  <Html>
    <Head>
      <script
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: mobileAppHeaderHintScript }}
      />
    </Head>
    <body>
      <Main />
      <NextScript />
    </body>
  </Html>
);

export default Document;
