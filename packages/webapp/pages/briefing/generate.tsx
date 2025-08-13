import React, { useEffect } from 'react';
import type { NextSeoProps } from 'next-seo';
import { GenerateBriefForFreeUserPage } from '@dailydotdev/shared/src/features/briefing/pages/GenerateBriefForFreeUserPage';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import { useRouter } from 'next/router';
import classed from '@dailydotdev/shared/src/lib/classed';
import { pageBorders } from '@dailydotdev/shared/src/components/utilities';
import { pageMainClassNames } from '@dailydotdev/shared/src/components/layout/PageWrapperLayout';
import ProtectedPage from '../../components/ProtectedPage';
import { getLayout } from '../../components/layouts/MainLayout';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';
import { getTemplatedTitle } from '../../components/layouts/utils';

const Container = classed(
  'main',
  pageMainClassNames,
  pageBorders,
  'items-stretch tablet:self-center laptop:min-h-page',
  '!px-0 mx-auto laptop:max-w-[48rem]',
);

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
      <Container>
        <GenerateBriefForFreeUserPage />
      </Container>
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
