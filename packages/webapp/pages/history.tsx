import type { ReactElement } from 'react';
import React from 'react';
import type { NextSeoProps } from 'next-seo';
import { useRouter } from 'next/router';
import { ShellPage } from '@dailydotdev/shared/src/components/shell/ShellPageContext';
import { ReadingHistory } from '../components/history';
import ProtectedPage from '../components/ProtectedPage';
import { getLayout } from '../components/layouts/MainLayout';
import { getLayout as getFooterNavBarLayout } from '../components/layouts/FooterNavBarLayout';

const History = (): ReactElement | null => {
  const router = useRouter();

  if (!router.isReady) {
    return null;
  }

  return (
    <ProtectedPage>
      <ShellPage title="History" />
      <div className="relative flex w-full flex-col" role="main">
        <ReadingHistory />
      </div>
    </ProtectedPage>
  );
};

const geHistoryLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

const seo: NextSeoProps = { title: 'History', nofollow: true, noindex: true };

History.getLayout = geHistoryLayout;
History.layoutProps = { seo };

export default History;
