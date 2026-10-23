import type { ReactElement } from 'react';
import React from 'react';
import { Html, Head, Main, NextScript } from 'next/document';

const Document = (): ReactElement => (
  <Html>
    <Head />
    <body>
      <Main />
      <NextScript />
    </body>
  </Html>
);

export default Document;
