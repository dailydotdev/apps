import type { PropsWithChildren, ReactElement } from 'react';
import React from 'react';
import Head from 'next/head';
import Providers from './providers';
import { AppHeadMetas } from '../../shared/src/features/common/components/AppHeadMetas';
import '@dailydotdev/shared/src/styles/globals.css';

export default function RootLayout({
  children,
}: PropsWithChildren): ReactElement {
  return (
    <html lang="en">
      <Head>
        <AppHeadMetas />
      </Head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
