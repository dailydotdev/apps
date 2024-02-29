import React, {
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { NextSeo } from 'next-seo';
import { ResponsivePageContainer } from '@dailydotdev/shared/src/components/utilities';
import { useRouter } from 'next/router';
import {
  Tab,
  TabContainer,
} from '@dailydotdev/shared/src/components/tabs/TabContainer';
import { SearchHistory } from '@dailydotdev/shared/src/components';
import { useViewSize, ViewSize } from '@dailydotdev/shared/src/hooks';
import { AnalyticsEvent, Origin } from '@dailydotdev/shared/src/lib/analytics';
import AnalyticsContext from '@dailydotdev/shared/src/contexts/AnalyticsContext';
import { getLayout } from '../components/layouts/MainLayout';
import ProtectedPage from '../components/ProtectedPage';
import { HistoryType, ReadingHistory } from '../components/history';

const History = (): ReactElement => {
  const { trackEvent } = useContext(AnalyticsContext);
  const isLaptop = useViewSize(ViewSize.Laptop);
  const seo = <NextSeo title="History" nofollow noindex />;
  const router = useRouter();
  const tabQuery = router.query?.t?.toString() as HistoryType;
  const [page, setPage] = useState(HistoryType.Reading);

  const handleSetPage = useCallback(
    (active: HistoryType) => {
      setPage(active);

      if (active === HistoryType.Search) {
        trackEvent({ event_name: AnalyticsEvent.OpenSearchHistory });
      }
    },
    [setPage, trackEvent],
  );

  useEffect(() => {
    const pages = Object.values(HistoryType);
    if (!tabQuery || !pages.includes(tabQuery)) {
      return;
    }

    setPage(tabQuery);
  }, [tabQuery]);

  if (!router.isReady) {
    return seo;
  }

  return (
    <ProtectedPage seo={seo}>
      <div className="absolute left-0 top-[6.75rem] flex h-px w-full bg-theme-divider-tertiary laptop:hidden" />
      <ResponsivePageContainer className="relative !p-0" role="main">
        <TabContainer<HistoryType>
          controlledActive={page}
          onActiveChange={handleSetPage}
          showBorder={isLaptop}
        >
          <Tab label={HistoryType.Reading}>
            <ReadingHistory />
          </Tab>
          <Tab label={HistoryType.Search}>
            <SearchHistory origin={Origin.HistoryPage} />
          </Tab>
        </TabContainer>
      </ResponsivePageContainer>
    </ProtectedPage>
  );
};

History.getLayout = getLayout;

export default History;
