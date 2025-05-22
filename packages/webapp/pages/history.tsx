import type { ReactElement } from 'react';
import React from 'react';
import type { NextSeoProps } from 'next-seo';
import { ResponsivePageContainer } from '@dailydotdev/shared/src/components/utilities';
import { useRouter } from 'next/router';
import { useViewSize, ViewSize } from '@dailydotdev/shared/src/hooks';
import { ReadingHistory } from '../components/history';
import ProtectedPage from '../components/ProtectedPage';
import { getLayout } from '../components/layouts/MainLayout';
import { getLayout as getFooterNavBarLayout } from '../components/layouts/FooterNavBarLayout';

const History = (): ReactElement => {
  const isLaptop = useViewSize(ViewSize.Laptop);
  const router = useRouter();

  if (!router.isReady) {
    return null;
  }

  return (
    <ProtectedPage>
      {isLaptop && (
        <div className="absolute left-0 top-[6.75rem] flex h-px w-full bg-border-subtlest-tertiary laptop:hidden" />
      )}

      <ResponsivePageContainer className="relative !p-0" role="main">
        <ReadingHistory />
      </ResponsivePageContainer>
    </ProtectedPage>
  );
};

const geHistoryLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

const seo: NextSeoProps = { title: 'History', nofollow: true, noindex: true };

History.getLayout = geHistoryLayout;
History.layoutProps = { seo };

export default History;
