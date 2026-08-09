import type { ReactElement } from 'react';
import React, { useEffect, useMemo } from 'react';
import type { NextSeoProps } from 'next-seo';
import { useRouter } from 'next/router';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import { useQuery } from '@tanstack/react-query';
import { useConditionalFeature } from '@dailydotdev/shared/src/hooks/useConditionalFeature';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useToastNotification } from '@dailydotdev/shared/src/hooks/useToastNotification';
import { featureInterestAgent } from '@dailydotdev/shared/src/lib/featureManagement';
import {
  interestQueryOptions,
  interestPostsQueryOptions,
} from '@dailydotdev/shared/src/features/interests/queries';
import { useDeleteInterest } from '@dailydotdev/shared/src/features/interests/hooks/useDeleteInterest';
import { useAgentFeed } from '@dailydotdev/shared/src/features/interests/hooks/useAgentFeed';
import { AgentProvider } from '@dailydotdev/shared/src/features/interests/AgentContext';
import { AgentWorkspace } from '@dailydotdev/shared/src/features/interests/components/AgentWorkspace';
import { AgentWorkspaceSkeleton } from '@dailydotdev/shared/src/features/interests/components/AgentWorkspaceSkeleton';
import {
  mockAgentPosts,
  mockInterest,
} from '@dailydotdev/shared/src/features/interests/mock';
import { mockFeedItems } from '@dailydotdev/shared/src/features/interests/mockFeed';
import { mockConversation } from '@dailydotdev/shared/src/features/interests/chat';
import { openingMessages } from '@dailydotdev/shared/src/features/interests/openingMessages';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';
import { getLayout } from '../../components/layouts/MainLayout';
import ProtectedPage from '../../components/ProtectedPage';
import { getPageSeoTitles } from '../../components/layouts/utils';

// `?demo=1` is the design surface: entirely mock data, no API calls, no
// feature gate and no auth wall, so a preview link is reviewable by anyone.
// The live page below is what ships once the backend lands.
const DemoAgentPage = ({ id }: { id: string }): ReactElement => {
  const { displayToast } = useToastNotification();

  return (
    <AgentProvider
      id={id}
      interest={mockInterest}
      isDemo
      initialMessages={mockConversation}
      key={id}
    >
      <AgentWorkspace
        items={mockFeedItems}
        postsCount={mockAgentPosts.length}
        onDelete={() => displayToast('Demo agent — nothing was deleted')}
        isDeleting={false}
      />
    </AgentProvider>
  );
};

const LiveAgentPage = ({ id }: { id: string }): ReactElement | null => {
  const router = useRouter();
  const { user, isAuthReady } = useAuthContext();
  const { value: showAgent } = useConditionalFeature({
    feature: featureInterestAgent,
    // Signed-in only, as at every other entry point: evaluating enrolls, and an
    // anonymous visitor can never see the feature to be measured on it.
    shouldEvaluate: isAuthReady && !!user,
  });
  // A signed-in reader without the flag has nothing here. An anonymous one has
  // not been evaluated at all, so they fall through to the sign-in wall rather
  // than being bounced off a page the flag never spoke about.
  const isGatedOut = isAuthReady && !!user && !showAgent;

  const interestQuery = useQuery(interestQueryOptions(id, user));
  const postsQuery = useQuery(interestPostsQueryOptions(id, user));
  const feed = useAgentFeed({ id, forceDemo: false });
  const { isDeleting, deleteInterest } = useDeleteInterest({
    onDeleted: () => router.push(`${webappUrl}agent`),
  });

  const realPosts = postsQuery.data ?? [];
  const posts = feed.isDemo && !realPosts.length ? mockAgentPosts : realPosts;
  const interest =
    interestQuery.data ?? (feed.isDemo ? mockInterest : undefined);
  // Only what this agent actually found. `feed.items` falls back to mock
  // findings for the design surface, and an opening turn citing posts the agent
  // never saw is worse than one citing none.
  const findings = feed.isDemo ? [] : feed.items;
  // The findings by identity rather than by count: `feed.items` is a new array
  // every render, and keying on its length left the opening turn citing the
  // previous posts when a refetch returned the same number of different ones.
  const findingIds = findings.map((finding) => finding.id).join();
  // A real agent has no stored transcript yet, so it opens with the prompt that
  // spawned it and the agent's answer — rebuilt from the interest. Memoised
  // because the provider adopts it by identity.
  const initialMessages = useMemo(
    () => (interest ? openingMessages(interest, findings) : mockConversation),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [interest, findingIds],
  );

  useEffect(() => {
    if (isGatedOut) {
      router.replace(webappUrl);
    }
  }, [isGatedOut, router]);

  if (isGatedOut) {
    return null;
  }

  // The interest is what the whole page is about, and its findings are what the
  // opening turn cites, so there is nothing honest to draw until both land. The
  // skeleton holds the shape rather than the page showing an agent with no name
  // and a conversation with no turns.
  if (user && (interestQuery.isPending || feed.isPending)) {
    return (
      <ProtectedPage>
        <AgentWorkspaceSkeleton />
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage>
      <AgentProvider
        id={id}
        interest={interest}
        isDemo={feed.isDemo}
        initialMessages={initialMessages}
        key={id}
      >
        <AgentWorkspace
          items={feed.items}
          postsCount={posts.length}
          onDelete={() => deleteInterest(id)}
          isDeleting={isDeleting}
        />
      </AgentProvider>
    </ProtectedPage>
  );
};

const Page = (): ReactElement | null => {
  const router = useRouter();
  const id = router.query.id as string;

  return router.query.demo === '1' ? (
    <DemoAgentPage id={id} />
  ) : (
    <LiveAgentPage id={id} />
  );
};

const getAgentLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

const seo: NextSeoProps = {
  ...getPageSeoTitles('Interest'),
  nofollow: true,
  noindex: true,
};

Page.getLayout = getAgentLayout;
Page.layoutProps = { seo, screenCentered: false, hideFeedbackWidget: true };

export default Page;
