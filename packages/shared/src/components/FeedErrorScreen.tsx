import React, { ReactElement } from 'react';
import { PageContainer } from './utilities';
import ServerError from './errors/ServerError';

function FeedErrorScreen(): ReactElement {
  return (
    <div className="flex h-full w-full">
      <PageContainer className="mx-auto !min-h-[calc(100vh-228px)] items-center justify-center tablet:!min-h-[calc(100vh-104px)]">
        <ServerError themedImage />
      </PageContainer>
    </div>
  );
}

export default FeedErrorScreen;
