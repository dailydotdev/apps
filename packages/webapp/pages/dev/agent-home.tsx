import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import { NextSeo } from 'next-seo';
import { AgentDemoProviders } from '@dailydotdev/shared/src/features/interests/components/AgentDemoProviders';
import { AgentHomeScreen } from '@dailydotdev/shared/src/features/interests/components/AgentHomeScreen';
import { recentMockAgents } from '@dailydotdev/shared/src/features/interests/mock';

/**
 * /dev/agent-home — internal review surface for the agents home screen.
 *
 * Same reason as `/dev/agent`: the real page is behind auth and a flag, so it
 * shows nothing on a dev server with no backend. `?loading=1` holds the list in
 * its loading state, which is otherwise too brief to review, and `?q=` stands in
 * for arriving on a shared agent link — the receiving half of sharing, which is
 * otherwise only reachable behind the flag. Carries `noindex`/`nofollow`.
 */
const Page = (): ReactElement => {
  // Read off the URL after mount rather than during the render: the server has
  // no window, and the search string is the only difference between the two, so
  // reading it while rendering is a hydration mismatch by construction.
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

// Request time rather than build time. These surfaces are drawn from mock data
// measured off the current hour, and prerendered HTML is from whenever the deploy
// happened, so every elapsed time on the page hydrates as a mismatch. Applied
// across the whole /dev/agent* family so a timestamp added to any of them later
// cannot quietly bring it back.
export const getServerSideProps = async () => ({ props: {} });

export default Page;
