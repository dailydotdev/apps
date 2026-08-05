import type { ReactElement, ReactNode } from 'react';
import React, { useEffect } from 'react';
import type { NextSeoProps } from 'next-seo';
import { useRouter } from 'next/router';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import { useQuery } from '@tanstack/react-query';
import { useConditionalFeature } from '@dailydotdev/shared/src/hooks/useConditionalFeature';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import type { MainLayoutProps } from '@dailydotdev/shared/src/components/MainLayout';
import { BOOT_QUERY_KEY } from '@dailydotdev/shared/src/contexts/common';
import Toast from '@dailydotdev/shared/src/components/notifications/Toast';
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

// `MainLayout` holds its paint until boot resolves, so with no API reachable
// (a local dev server without a backend) the whole page stays blank. The demo
// runs on mock data alone, so it falls back to its own shell and stays
// reviewable. When boot does resolve — preview, production — nothing changes
// and the demo keeps the real app chrome.
const useIsBootUnavailable = (): boolean => {
  const { isAuthReady } = useAuthContext();
  const { isError } = useQuery({
    queryKey: BOOT_QUERY_KEY,
    queryFn: () => null,
    enabled: false,
  });

  return !isAuthReady && isError;
};

const DemoShell = ({ children }: { children: ReactNode }): ReactElement => (
  <div className="antialiased">
    <Toast autoDismissNotifications />
    {children}
  </div>
);

// `?demo=1` is the design surface: entirely mock data, no API calls, no
// feature gate and no auth wall, so a preview link is reviewable by anyone.
// The live page below is what ships once the backend lands.
const DemoAgentPage = ({ id }: { id: string }): ReactElement => {
  const { displayToast } = useToastNotification();
  const isStandalone = useIsBootUnavailable();

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
        isStandalone={isStandalone}
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

const AgentLayout = ({
  page,
  pageProps,
  layoutProps,
}: {
  page: ReactNode;
  pageProps?: Record<string, unknown>;
  layoutProps?: MainLayoutProps;
}): ReactElement => {
  const router = useRouter();
  const isBootUnavailable = useIsBootUnavailable();
  // Built unconditionally: `getLayout` calls `useRouter` itself, so branching
  // before it would move a hook in and out of the render.
  const chrome = getFooterNavBarLayout(getLayout(page, pageProps, layoutProps));

  if (router.query.demo === '1' && isBootUnavailable) {
    return <DemoShell>{page}</DemoShell>;
  }

  return <>{chrome}</>;
};

const getAgentLayout: typeof getLayout = (page, pageProps, layoutProps) => (
  <AgentLayout page={page} pageProps={pageProps} layoutProps={layoutProps} />
);

const seo: NextSeoProps = {
  ...getPageSeoTitles('Interest'),
  nofollow: true,
  noindex: true,
};

Page.getLayout = getAgentLayout;
Page.layoutProps = { seo, screenCentered: false, hideFeedbackWidget: true };

export default Page;
