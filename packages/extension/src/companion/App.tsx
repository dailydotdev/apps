import React, { ReactElement, useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { browser } from 'webextension-polyfill-ts';
import { PostBootData } from '@dailydotdev/shared/src/lib/boot';
import { RemoteSettings } from '@dailydotdev/shared/src/graphql/settings';
import Companion from './Companion';

const queryClient = new QueryClient();

export interface CompanionData {
  postData: PostBootData;
  settings: Pick<RemoteSettings, 'optOutCompanion' | 'theme'>;
}
export default function App({
  postData,
  settings,
}: CompanionData): ReactElement {
  const [isOptOutCompanion, setIsOptOutCompanion] = useState<boolean>(
    settings?.optOutCompanion,
  );
  if (isOptOutCompanion) {
    return <></>;
  }

  return (
    <div>
      <style>
        @import &quot;chrome-extension://{browser.runtime.id}
        /css/companion.css&quot;;
      </style>
      <QueryClientProvider client={queryClient}>
        <Companion
          postData={postData}
          onOptOut={() => setIsOptOutCompanion(true)}
        />
      </QueryClientProvider>
    </div>
  );
}
