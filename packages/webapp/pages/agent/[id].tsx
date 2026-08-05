import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
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
import {
  mockAgentPosts,
  mockInterest,
} from '@dailydotdev/shared/src/features/interests/mock';
import { mockFeedItems } from '@dailydotdev/shared/src/features/interests/mockFeed';
import { mockConversation } from '@dailydotdev/shared/src/features/interests/chat';
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
    shouldEvaluate: isAuthReady,
  });

  const interestQuery = useQuery(interestQueryOptions(id, user));
  const postsQuery = useQuery(interestPostsQueryOptions(id, user));
  const feed = useAgentFeed({ id, forceDemo: false });
  const { isDeleting, deleteInterest } = useDeleteInterest({
    onDeleted: () => router.push(`${webappUrl}agent`),
  });

  useEffect(() => {
    if (isAuthReady && !showAgent) {
      router.replace(webappUrl);
    }
  }, [isAuthReady, showAgent, router]);

  if (isAuthReady && !showAgent) {
    return null;
  }

  const realPosts = postsQuery.data ?? [];
  const posts = feed.isDemo && !realPosts.length ? mockAgentPosts : realPosts;
  const interest =
    interestQuery.data ?? (feed.isDemo ? mockInterest : undefined);

  return (
    <ProtectedPage>
      <AgentProvider
        id={id}
        interest={interest}
        isDemo={feed.isDemo}
        initialMessages={feed.isDemo ? mockConversation : []}
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
