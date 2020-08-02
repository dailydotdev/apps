import React, { ReactElement } from 'react';
import { AppProps } from 'next/app';
import { ApolloProvider, NormalizedCacheObject } from '@apollo/client';
import { useApollo } from '../lib/apolloClient';

import '../styles/globals.css';

interface PageProps {
  initialApolloState: NormalizedCacheObject;
}

export default function App({
  Component,
  pageProps,
}: AppProps<PageProps>): ReactElement {
  const apolloClient = useApollo(pageProps.initialApolloState);

  return (
    <ApolloProvider client={apolloClient}>
      <Component {...pageProps} />
    </ApolloProvider>
  );
}
