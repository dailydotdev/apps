import React, { useEffect } from 'react';
import type { NextSeoProps } from 'next-seo';
import { GenerateBriefForFreeUserPage } from '@dailydotdev/shared/src/features/briefing/pages/GenerateBriefForFreeUserPage';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import { useRouter } from 'next/router';
import { PostContainer } from '@dailydotdev/shared/src/components/post/common';
import { PageBodyContainer } from '@dailydotdev/shared/src/components/post/PostContentContainer';
import ProtectedPage from '../../components/ProtectedPage';
import { getLayout } from '../../components/layouts/MainLayout';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';
import { getTemplatedTitle } from '../../components/layouts/utils';

function Page() {
  const { isAuthReady, user } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (isAuthReady && user?.isPlus) {
      router.push(`${webappUrl}/briefing`);
    }
  }, [user?.isPlus, router, isAuthReady]);

  if (!isAuthReady) {
    return null;
  }

  return (
    <ProtectedPage>
      <PostContainer>
        <PageBodyContainer>
          <GenerateBriefForFreeUserPage />
        </PageBodyContainer>
      </PostContainer>
    </ProtectedPage>
  );
}

const getBriefingLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

const seo: NextSeoProps = {
  title: getTemplatedTitle('Presidential briefings'),
  description:
    'Fast, high-signal briefings delivered straight to you by your personal AI agent.',
  nofollow: true,
  noindex: true,
};

Page.getLayout = getBriefingLayout;
Page.layoutProps = { seo, screenCentered: false };

export default Page;
