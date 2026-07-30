import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
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
import { AgentActivitySection } from '@dailydotdev/shared/src/features/interests/components/AgentActivitySection';
import { AgentDebugPanel } from '@dailydotdev/shared/src/features/interests/components/AgentDebugPanel';
import { AgentSettingsModal } from '@dailydotdev/shared/src/features/interests/components/AgentSettingsModal';
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

type AgentTab = 'Chat' | 'Activity' | 'Debug';

const AgentPageBody = ({
  items,
  postsCount,
  onDelete,
  isDeleting,
}: {
  items: AgentFeedItem[];
  postsCount: number;
  onDelete: () => void;
  isDeleting: boolean;
}): ReactElement => {
  const { isSettingsOpen, setSettingsOpen } = useAgent();
  const [tab, setTab] = useState<AgentTab>('Chat');

  return (
    <>
      <FlexCol className="mx-auto w-full max-w-[48rem] gap-6 px-4 pb-72 pt-4">
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
        <PageHeader title={interest?.query ?? 'Your agent'}>
          <Link href={`${webappUrl}agent`}>
            <Button
              tag="a"
              icon={<ArrowIcon className="-rotate-90" />}
              size={ButtonSize.Small}
              variant={ButtonVariant.Tertiary}
            />
          </Link>
        </PageHeader>
        <AgentPageBody
          items={feed.items}
          postsCount={posts.length}
          onDelete={() => deleteInterest(id)}
          isDeleting={isDeleting}
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
