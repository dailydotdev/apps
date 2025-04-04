import type { PropsWithChildren, ReactElement } from 'react';
import React from 'react';
import Head from 'next/head';
import { AppHeadMetas } from '@dailydotdev/shared/src/features/common/components/AppHeadMetas';
import Providers from './providers';
import '@dailydotdev/shared/src/styles/globals.css';

// todo: Improve this by moving metas to metadta object as suggested in https://nextjs.org/docs/app/building-your-application/optimizing/metadata
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
