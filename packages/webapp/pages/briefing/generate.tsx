import React from 'react';
import type { NextSeoProps } from 'next-seo';
import { GenerateBriefForFreeUserPage } from '@dailydotdev/shared/src/features/briefing/components/GenerateBriefForFreeUserPage';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import ProtectedPage from '../../components/ProtectedPage';
import { getLayout } from '../../components/layouts/MainLayout';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';
import { getTemplatedTitle } from '../../components/layouts/utils';

function Page() {
  const { isAuthReady } = useAuthContext();

  if (!isAuthReady) {
    return null;
  }

  return (
    <ProtectedPage>
      <div className="m-auto flex w-full max-w-[69.25rem] flex-col pb-4">
        <GenerateBriefForFreeUserPage />
      </div>
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
