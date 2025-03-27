import type { PropsWithChildren, ReactElement } from 'react';
import React from 'react';
import Providers from './providers';

export default function RootLayout({
  children,
}: PropsWithChildren): ReactElement {
  return (
    <html lang="en">
      <body>
        <Providers>
          <>{children}</>
        </Providers>
      </body>
    </html>
  );
}
