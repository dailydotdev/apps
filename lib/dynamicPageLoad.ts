import React from 'react';
import { LoaderComponent } from 'next/dist/next-server/lib/dynamic';
import dynamic from 'next/dynamic';
import onPageLoad from './onPageLoad';

export default function dynamicPageLoad<P>(
  loader: () => LoaderComponent<P>,
  readyState: DocumentReadyState = 'interactive',
): React.ComponentType<P> {
  return dynamic<P>(() => onPageLoad(readyState).then(loader), { ssr: false });
}
