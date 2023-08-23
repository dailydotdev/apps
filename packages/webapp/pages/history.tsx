import React, { ReactElement, useEffect, useState } from 'react';
import { NextSeo } from 'next-seo';
import { ResponsivePageContainer } from '@dailydotdev/shared/src/components/utilities';
import { useRouter } from 'next/router';
import {
  Tab,
  TabContainer,
} from '@dailydotdev/shared/src/components/tabs/TabContainer';
import { getLayout } from '../components/layouts/MainLayout';
import ProtectedPage from '../components/ProtectedPage';
import {
  HistoryType,
  ReadingHistory,
  SearchHistory,
} from '../components/history';

const History = (): ReactElement => {
  const seo = <NextSeo title="Reading History" nofollow noindex />;
  const router = useRouter();
  const tabQuery = router.query?.t?.toString() as HistoryType;
  const [page, setPage] = useState(HistoryType.Reading);

  useEffect(() => {
    const pages = Object.values(HistoryType);

    if (!tabQuery || !pages.includes(tabQuery)) return;

    setPage(tabQuery);
  }, [tabQuery]);

  if (!router.isReady) return seo;

  return (
    <ProtectedPage seo={seo}>
      <ResponsivePageContainer className="!p-0" role="main">
        <TabContainer<HistoryType>
          controlledActive={page}
          onActiveChange={setPage}
          className={{ container: 'max-h-page h-full' }}
        >
          <Tab label={HistoryType.Reading}>
            <ReadingHistory />
          </Tab>
          <Tab label={HistoryType.Search}>
            <SearchHistory />
          </Tab>
        </TabContainer>
      </ResponsivePageContainer>
    </ProtectedPage>
  );
};

History.getLayout = getLayout;

export default History;
