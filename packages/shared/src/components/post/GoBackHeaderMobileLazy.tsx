import React from 'react';
import dynamic from 'next/dynamic';

// The header reads history and the router, so it only renders on the client.
// next/dynamic resolves its loader on the first render even when the chunk
// is already loaded, which puts the header one frame behind the page that
// mounts it unless the loader was run ahead of time.
export const LazyGoBackHeaderMobile = dynamic(
  () =>
    import(/* webpackChunkName: "goBackHeaderMobile" */ './GoBackHeaderMobile'),
  {
    ssr: false,
    loading: () => (
      <div className="-mx-4 hidden h-12 border-b border-border-subtlest-tertiary tablet:block laptop:hidden" />
    ),
  },
);

export const preloadGoBackHeaderMobile = (): void => {
  const loadable = LazyGoBackHeaderMobile as {
    preload?: () => Promise<unknown>;
  };
  Promise.resolve(loadable.preload?.()).catch(() => undefined);
};
