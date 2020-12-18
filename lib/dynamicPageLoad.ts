import React from 'react';
import { LoaderComponent } from 'next/dist/next-server/lib/dynamic';
import dynamic from 'next/dynamic';

export default function dynamicPageLoad<P>(
  loader: () => LoaderComponent<P>,
  readyState: DocumentReadyState = 'interactive',
): React.ComponentType<P> {
  return dynamic<P>(
    () =>
      new Promise((resolve, reject) => {
        const callLoader = () => loader().then(resolve).catch(reject);

        if (document.readyState === readyState) {
          return callLoader();
        }

        const callback = (event: ProgressEvent<Document>) => {
          if (event.target.readyState === readyState) {
            document.removeEventListener('readystatechange', callback);
            return callLoader();
          }
        };
        document.addEventListener('readystatechange', callback);
      }),
    { ssr: false },
  );
}
