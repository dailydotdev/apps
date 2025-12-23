import type { ReactElement } from 'react';
import React from 'react';
import type { ClientError } from 'graphql-request';
import { PageContainer } from './utilities';
import ServerError from './errors/ServerError';
import ConnectionError from './errors/ConnectionError';
import { isConnectionError } from '../lib/errors';

function FeedErrorScreen({ error }: { error?: ClientError }): ReactElement {
  const isNetworkError = isConnectionError(error);

  return (
    <div className="flex h-full w-full">
      <PageContainer className="mx-auto !min-h-[calc(100vh-228px)] items-center justify-center tablet:!min-h-[calc(100vh-104px)]">
        {isNetworkError ? (
          <ConnectionError onRetry={() => window.location.reload()} />
        ) : (
          <ServerError themedImage />
        )}
      </PageContainer>
    </div>
  );
}

export default FeedErrorScreen;
