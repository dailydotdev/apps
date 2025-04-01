import type { PropsWithChildren, ReactElement } from 'react';
import React from 'react';
import Providers from './providers';
import '@dailydotdev/shared/src/styles/globals.css';

export default function RootLayout({
  children,
}: PropsWithChildren): ReactElement {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
