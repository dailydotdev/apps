import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import type { NextSeoProps } from 'next-seo';
import { useRouter } from 'next/router';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import { useMessagesEnabled } from '@dailydotdev/shared/src/features/messages/hooks/useMessagesEnabled';
import { MessagesScreen } from '@dailydotdev/shared/src/features/messages/components/MessagesScreen';
import { getMessagesUrl } from '@dailydotdev/shared/src/features/messages/urls';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';
import { getLayout } from '../../components/layouts/MainLayout';
import ProtectedPage from '../../components/ProtectedPage';
import { getPageSeoTitles } from '../../components/layouts/utils';

// One route for the inbox and every thread, so opening a conversation keeps the
// list mounted instead of swapping pages.
const Page = (): ReactElement | null => {
  const router = useRouter();
  const { isEnabled, isGatedOut } = useMessagesEnabled();
  const [peerId] = (router.query.peer as string[] | undefined) ?? [];
  const commentId =
    typeof router.query.comment === 'string' ? router.query.comment : undefined;

  useEffect(() => {
    if (isGatedOut) {
      router.replace(webappUrl);
    }
  }, [isGatedOut, router]);

  if (isGatedOut || !router.isReady) {
    return null;
  }

  return (
    <ProtectedPage>
      {isEnabled && (
        <MessagesScreen
          activePeerId={peerId}
          commentId={commentId}
          // Dropped from the URL once used, so a reload can't attach it twice.
          onCommentContextUsed={() =>
            router.replace(getMessagesUrl(peerId), undefined, {
              shallow: true,
            })
          }
        />
      )}
    </ProtectedPage>
  );
};

const getMessagesLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

const seo: NextSeoProps = {
  ...getPageSeoTitles('Messages'),
  nofollow: true,
  noindex: true,
};

Page.getLayout = getMessagesLayout;
Page.layoutProps = { seo, screenCentered: false, hideFeedbackWidget: true };

export default Page;
