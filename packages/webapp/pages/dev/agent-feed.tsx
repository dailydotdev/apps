import type { ReactElement } from 'react';
import React, { useState } from 'react';
import { NextSeo } from 'next-seo';
import { AgentDemoProviders } from '@dailydotdev/shared/src/features/interests/components/AgentDemoProviders';
import { AgentProvider } from '@dailydotdev/shared/src/features/interests/AgentContext';
import { AgentGlassComposer } from '@dailydotdev/shared/src/features/interests/components/AgentGlassComposer';
import { AgentRunStrip } from '@dailydotdev/shared/src/features/interests/components/AgentRunStrip';
import { AgentPostCard } from '@dailydotdev/shared/src/features/interests/components/AgentPostCard';
import { mockFeedPosts } from '@dailydotdev/shared/src/features/interests/mockFeed';
import { mockAgents } from '@dailydotdev/shared/src/features/interests/mock';

/**
 * /dev/agent-feed — the glass prompt docked over a feed.
 *
 * The real mount is `MainFeedPage`, which needs boot and the `interest_agent`
 * flag, so it renders nothing on a dev server with no backend. This route
 * stands the same field over a mock feed. Carries `noindex`/`nofollow`.
 */
const Page = (): ReactElement => {
  const [query, setQuery] = useState('');

  return (
    <AgentDemoProviders>
      <NextSeo title="Agent feed prompt" noindex nofollow />
      {/* The cards carry an add-to-chat button, which reads the agent it
          belongs to. */}
      <AgentProvider id="demo" isDemo initialMessages={[]}>
        <div className="min-h-[100dvh] bg-background-default pb-40 pt-6">
          <div className="mx-auto flex w-full max-w-[40rem] flex-col gap-3 px-4">
            {mockFeedPosts.map((post) => (
              <AgentPostCard
                key={post.id}
                post={post}
                onOpen={() => undefined}
              />
            ))}
          </div>
          <div className="fixed inset-x-0 bottom-6 flex justify-center px-4">
            <AgentGlassComposer
              value={query}
              onChange={setQuery}
              onSubmit={() => undefined}
              banner={<AgentRunStrip agents={mockAgents.slice(0, 2)} />}
              className="max-w-[36rem]"
            />
          </div>
        </div>
      </AgentProvider>
    </AgentDemoProviders>
  );
};

export default Page;
