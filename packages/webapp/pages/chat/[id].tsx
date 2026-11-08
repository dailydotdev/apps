import type { ReactElement } from 'react';
import React from 'react';
import type { NextSeoProps } from 'next-seo';
import { useRouter } from 'next/router';
import { TopicChatScreen } from '@dailydotdev/shared/src/features/liveChat/components/TopicChatScreen';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';
import { getLayout } from '../../components/layouts/MainLayout';
import { getPageSeoTitles } from '../../components/layouts/utils';
import { noindexSeoProps } from '../../next-seo';

// A live chat on a topic, full screen. The room is public to look at, so
// the page is too; joining asks for a sign-in.
const Page = (): ReactElement | null => {
  const router = useRouter();
  const id = typeof router.query.id === 'string' ? router.query.id : undefined;

  if (!router.isReady || !id) {
    return null;
  }

  return <TopicChatScreen roomId={id} />;
};

const getChatLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

const seo: NextSeoProps = {
  ...getPageSeoTitles('Live chat'),
  ...noindexSeoProps,
};

Page.getLayout = getChatLayout;
Page.layoutProps = { seo, hideFeedbackWidget: true };

export default Page;
