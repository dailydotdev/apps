import React, { ReactElement } from 'react';
import { PageContainer } from './utilities';
import ServerError from './errors/ServerError';

function FeedErrorScreen(): ReactElement {
  return (
    <PageContainer className="mx-auto !ml-0 !min-h-[calc(100vh-228px)] items-center justify-center tablet:!min-h-[calc(100vh-104px)]">
      <ServerError themedImage />
    </PageContainer>
  );
}

export default FeedErrorScreen;
