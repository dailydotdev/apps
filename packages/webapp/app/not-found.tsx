import type { Metadata } from 'next';
import type { ReactElement } from 'react';
import React from 'react';
import { NotFoundContent } from './not-found-content';

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: false },
};

// Pages Router routes that return `notFound` are served by the App Router's
// not-found in a hybrid app, so this has to match pages/404.tsx.
export default function NotFound(): ReactElement {
  return <NotFoundContent />;
}
