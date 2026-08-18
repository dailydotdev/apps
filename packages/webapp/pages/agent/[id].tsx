import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import type { NextSeoProps } from 'next-seo';
import { useRouter } from 'next/router';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import { useQuery } from '@tanstack/react-query';
import { useConditionalFeature } from '@dailydotdev/shared/src/hooks/useConditionalFeature';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
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
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';
import { getLayout } from '../../components/layouts/MainLayout';
import ProtectedPage from '../../components/ProtectedPage';
import { getPageSeoTitles } from '../../components/layouts/utils';

const LiveAgentPage = ({ id }: { id: string }): ReactElement | null => {
  const router = useRouter();
  const { user, isAuthReady } = useAuthContext();
  const { value: showAgent } = useConditionalFeature({
    feature: featureInterestAgent,
    // Evaluating enrolls, so an anonymous visitor must not be measured.
    shouldEvaluate: isAuthReady && !!user,
  });
  // An anonymous reader was never evaluated, so they get the sign-in wall below
  // rather than the redirect.
  const isGatedOut = isAuthReady && !!user && !showAgent;
  const isQueryEnabled = showAgent && !!user?.id && !!id;

  const interestQuery = useQuery({
    ...interestQueryOptions(id, user),
    enabled: isQueryEnabled,
  });
  const postsQuery = useQuery({
    ...interestPostsQueryOptions(id, user),
    enabled: isQueryEnabled,
  });
  const feed = useAgentFeed({ id, enabled: isQueryEnabled });
  const { isDeleting, deleteInterest } = useDeleteInterest({
    onDeleted: () => router.push(`${webappUrl}agent`),
  });

  const posts = postsQuery.data ?? [];
  // The query resolves `null` for an agent that is not there, which everything
  // downstream treats the same as not having loaded yet.
  const interest = interestQuery.data ?? undefined;

  useEffect(() => {
    if (isGatedOut) {
      router.replace(webappUrl);
    }
  }, [isGatedOut, router]);

  if (isGatedOut) {
    return null;
  }

  // Tied to not having the agent rather than to a pending query: every refetch
  // turns pending back on, and the skeleton would take the transcript down.
  const isLoading =
    !!user && !interest && (interestQuery.isPending || feed.isPending);

  return (
    <ProtectedPage>
      {/* Outside the loading branch, so a refetch cannot remount the provider
          and take the transcript with it. */}
      <AgentProvider
        id={id}
        interest={interest}
        isDemo={false}
        findings={feed.items}
        key={id}
      >
        {isLoading ? (
          <AgentWorkspaceSkeleton />
        ) : (
          <AgentWorkspace
            items={feed.items}
            postsCount={posts.length}
            // The mutation toasts its own failure; swallowed so the press does
            // not also reject unhandled.
            onDelete={() => deleteInterest(id).catch(() => undefined)}
            isDeleting={isDeleting}
          />
        )}
      </AgentProvider>
    </ProtectedPage>
  );
};

const Page = (): ReactElement | null => {
  const router = useRouter();

  // `router.query` is empty until the route resolves.
  if (!router.isReady) {
    return null;
  }

  return <LiveAgentPage id={router.query.id as string} />;
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
