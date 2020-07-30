import React, { ReactElement } from 'react';
import { ApolloProvider, NormalizedCacheObject } from '@apollo/client';
import { useApollo } from '../lib/apolloClient';

import '../styles/globals.css';

interface PageProps {
  initialApolloState: NormalizedCacheObject;
}

interface AppProps {
  Component: React.FC<PageProps>;
  pageProps: PageProps;
}

export default function App({ Component, pageProps }: AppProps): ReactElement {
  const apolloClient = useApollo(pageProps.initialApolloState);

  return (
    <ApolloProvider client={apolloClient}>
      <Component {...pageProps} />
    </ApolloProvider>
  );
}
