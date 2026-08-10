import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import { NextSeo } from 'next-seo';
import { AgentDemoProviders } from '@dailydotdev/shared/src/features/interests/components/AgentDemoProviders';
import { AgentHomeScreen } from '@dailydotdev/shared/src/features/interests/components/AgentHomeScreen';
import { recentMockAgents } from '@dailydotdev/shared/src/features/interests/mock';

// Reviews the home screen without auth or the flag. `?loading=1` holds the
// loading state, `?q=` stands in for arriving on a shared agent link.
const Page = (): ReactElement => {
  // After mount, not during the render: the server has no window, and the
  // search string is the only difference between the two.
  const [params, setParams] = useState<URLSearchParams>();

  useEffect(() => {
    setParams(new URLSearchParams(window.location.search));
  }, []);

  const isLoading = params?.get('loading') === '1';

  return (
    <AgentDemoProviders>
      <NextSeo title="Agents" noindex nofollow />
      <AgentHomeScreen
        agents={isLoading ? [] : recentMockAgents()}
        isPending={isLoading}
        initialQuery={params?.get('q') ?? ''}
        onCreate={() => undefined}
        isStandalone
      />
    </AgentDemoProviders>
  );
};

export { devPageServerSideProps as getServerSideProps } from '../../lib/devPage';

export default Page;
