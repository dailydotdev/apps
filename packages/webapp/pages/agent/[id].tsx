import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import type { NextSeoProps } from 'next-seo';
import { useRouter } from 'next/router';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { PageHeader } from '@dailydotdev/shared/src/components/layout/PageHeader';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons';
import { FlexCol } from '@dailydotdev/shared/src/components/utilities';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import {
  Tab,
  TabContainer,
} from '@dailydotdev/shared/src/components/tabs/TabContainer';
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
import {
  AgentProvider,
  useAgent,
} from '@dailydotdev/shared/src/features/interests/AgentContext';
import { AgentHero } from '@dailydotdev/shared/src/features/interests/components/AgentHero';
import { AgentToolbar } from '@dailydotdev/shared/src/features/interests/components/AgentToolbar';
import { AgentChatSection } from '@dailydotdev/shared/src/features/interests/components/AgentChatSection';
import { AgentContentPane } from '@dailydotdev/shared/src/features/interests/components/AgentContentPane';
import { AgentActivitySection } from '@dailydotdev/shared/src/features/interests/components/AgentActivitySection';
import { AgentDebugPanel } from '@dailydotdev/shared/src/features/interests/components/AgentDebugPanel';
import { AgentSettingsModal } from '@dailydotdev/shared/src/features/interests/components/AgentSettingsModal';
import { AgentViewToggle } from '@dailydotdev/shared/src/features/interests/components/AgentViewToggle';
import {
  mockAgentPosts,
  mockInterest,
} from '@dailydotdev/shared/src/features/interests/mock';
import { mockConversation } from '@dailydotdev/shared/src/features/interests/chat';
import type { AgentFeedItem } from '@dailydotdev/shared/src/features/interests/hooks/useAgentFeed';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';
import { getLayout } from '../../components/layouts/MainLayout';
import ProtectedPage from '../../components/ProtectedPage';
import { getPageSeoTitles } from '../../components/layouts/utils';

const ArticlePostModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "articlePostModal" */ '@dailydotdev/shared/src/components/modals/ArticlePostModal'
    ),
);
const AgentFeedModal = dynamic(() =>
  import(
    /* webpackChunkName: "agentFeedModal" */ '@dailydotdev/shared/src/features/interests/components/AgentFeedModal'
  ).then((mod) => mod.AgentFeedModal),
);

type AgentTab = 'Chat' | 'Activity' | 'Debug';

const AgentPageBody = ({
  items,
  postsCount,
  onDelete,
  isDeleting,
  isModalView,
}: {
  items: AgentFeedItem[];
  postsCount: number;
  onDelete: () => void;
  isDeleting: boolean;
  isModalView: boolean;
}): ReactElement => {
  const { isSettingsOpen, setSettingsOpen, activeContent, setActiveContent } =
    useAgent();
  const [tab, setTab] = useState<AgentTab>('Chat');
  const closeContent = () => setActiveContent(undefined);

  return (
    <>
      <div className="flex w-full flex-row items-start gap-6 px-4 pt-4 laptop:px-6">
        <FlexCol className="mx-auto w-full min-w-0 max-w-[48rem] gap-6 pb-72">
          <AgentHero findingsCount={items.length} postsCount={postsCount} />
          <TabContainer<AgentTab>
            controlledActive={tab}
            onActiveChange={setTab}
            showBorder
          >
            <Tab label="Chat" className="pt-4">
              <AgentChatSection />
            </Tab>
            <Tab label="Activity" className="pt-4">
              <AgentActivitySection />
            </Tab>
            <Tab label="Debug" className="pt-4">
              <AgentDebugPanel
                items={items}
                onDelete={onDelete}
                isDeleting={isDeleting}
              />
            </Tab>
          </TabContainer>
        </FlexCol>
        {activeContent && !isModalView && (
          <AgentContentPane content={activeContent} onClose={closeContent} />
        )}
      </div>
      {activeContent?.type === 'post' && isModalView && (
        <ArticlePostModal
          isOpen
          id={activeContent.post.id}
          post={activeContent.post}
          onRequestClose={closeContent}
        />
      )}
      {activeContent?.type === 'feed' && isModalView && (
        <AgentFeedModal
          isOpen
          label={activeContent.label}
          posts={activeContent.posts}
          onRequestClose={closeContent}
        />
      )}
      <AgentToolbar />
      {isSettingsOpen && (
        <AgentSettingsModal
          isOpen
          onRequestClose={() => setSettingsOpen(false)}
        />
      )}
    </>
  );
};

const Page = (): ReactElement | null => {
  const router = useRouter();
  const id = router.query.id as string;
  const forceDemo = router.query.demo === '1';
  const isModalView = router.query.view === 'modal';
  const { user, isAuthReady } = useAuthContext();
  const { value: showAgent } = useConditionalFeature({
    feature: featureInterestAgent,
    shouldEvaluate: isAuthReady,
  });

  const interestQuery = useQuery(interestQueryOptions(id, user));
  const postsQuery = useQuery(interestPostsQueryOptions(id, user));
  const feed = useAgentFeed({ id, forceDemo });
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
  const useMockPosts = forceDemo || (feed.isDemo && !realPosts.length);
  const posts = useMockPosts ? mockAgentPosts : realPosts;
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
        <PageHeader
          className="sticky top-14 z-header bg-background-default laptop:top-16"
          title={
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <Link href={`${webappUrl}agent`}>
                <Button
                  tag="a"
                  icon={<ArrowIcon className="-rotate-90" />}
                  size={ButtonSize.Small}
                  variant={ButtonVariant.Tertiary}
                />
              </Link>
              <strong className="min-w-0 flex-1 truncate typo-callout">
                {interest?.query ?? 'Your agent'}
              </strong>
            </div>
          }
        >
          <AgentViewToggle view={isModalView ? 'modal' : 'pane'} />
        </PageHeader>
        <AgentPageBody
          items={feed.items}
          postsCount={posts.length}
          onDelete={() => deleteInterest(id)}
          isDeleting={isDeleting}
          isModalView={isModalView}
        />
      </AgentProvider>
    </ProtectedPage>
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
Page.layoutProps = { seo, screenCentered: false };

export default Page;
