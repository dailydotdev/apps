import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import type { NextSeoProps } from 'next-seo';
import { useRouter } from 'next/router';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { TopicChatForm } from '@dailydotdev/shared/src/features/liveChat/components/TopicChatForm';
import { ResponsivePageContainer } from '@dailydotdev/shared/src/components/utilities/common';
import ProtectedPage from '../../components/ProtectedPage';
import { getLayout } from '../../components/layouts/MainLayout';
import { getPageSeoTitles } from '../../components/layouts/utils';
import { noindexSeoProps } from '../../next-seo';

// Rooms are team picks: only the daily.dev team gets the form, and everyone
// else is sent back to the feed.
const NewChatContent = (): ReactElement | null => {
  const router = useRouter();
  const { user, isAuthReady } = useAuthContext();
  const canOpen = !!user?.isTeamMember;

  useEffect(() => {
    if (isAuthReady && user && !canOpen) {
      router.replace('/');
    }
  }, [canOpen, isAuthReady, router, user]);

  if (!canOpen) {
    return null;
  }

  return (
    <ResponsivePageContainer className="gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-bold text-text-primary typo-title2">
          Open a live chat
        </h1>
        <p className="text-text-tertiary typo-callout">
          Set the topic. Everyone can join once it is on.
        </p>
      </div>
      <TopicChatForm />
    </ResponsivePageContainer>
  );
};

// ProtectedPage comes first so a logged-out visitor is sent to auth, not
// bounced to the feed by the team check.
const NewChatPage = (): ReactElement => (
  <ProtectedPage>
    <NewChatContent />
  </ProtectedPage>
);

const seo: NextSeoProps = {
  ...getPageSeoTitles('Open a live chat'),
  ...noindexSeoProps,
};

NewChatPage.getLayout = getLayout;
NewChatPage.layoutProps = { seo };

export default NewChatPage;
