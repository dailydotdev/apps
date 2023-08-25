import React, { ReactElement, useEffect, useState } from 'react';
import { NextSeo } from 'next-seo';
import { ResponsivePageContainer } from '@dailydotdev/shared/src/components/utilities';
import { useRouter } from 'next/router';
import {
  Tab,
  TabContainer,
} from '@dailydotdev/shared/src/components/tabs/TabContainer';
import { SearchHistory } from '@dailydotdev/shared/src/components';
import useMedia from '@dailydotdev/shared/src/hooks/useMedia';
import { laptop } from '@dailydotdev/shared/src/styles/media';
import { getLayout } from '../components/layouts/MainLayout';
import ProtectedPage from '../components/ProtectedPage';
import { HistoryType, ReadingHistory } from '../components/history';

const History = (): ReactElement => {
  const isLaptop = useMedia([laptop.replace('@media ', '')], [true], false);
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
      <div className="flex laptop:hidden absolute left-0 w-full h-px top-[6.75rem] bg-theme-divider-tertiary" />
      <ResponsivePageContainer className="relative !p-0" role="main">
        <TabContainer<HistoryType>
          controlledActive={page}
          onActiveChange={setPage}
          className={{ container: 'max-h-page h-full' }}
          showBorder={isLaptop}
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
