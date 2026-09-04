import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import '@dailydotdev/shared/src/styles/globals.css';

// The App Router only exists here for the service worker and the shared
// not-found page, so this root layout stays as thin as the framework allows.
export default function RootLayout({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  return (
    <html lang="en" translate="no">
      <body>{children}</body>
    </html>
  );
}
