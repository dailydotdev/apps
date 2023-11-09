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
import { useMedia } from '@dailydotdev/shared/src/hooks';
import { laptop } from '@dailydotdev/shared/src/styles/media';
import { useFeature } from '@dailydotdev/shared/src/components/GrowthBookProvider';
import { feature } from '@dailydotdev/shared/src/lib/featureManagement';
import { SearchExperiment } from '@dailydotdev/shared/src/lib/featureValues';
import { AnalyticsEvent, Origin } from '@dailydotdev/shared/src/lib/analytics';
import AnalyticsContext from '@dailydotdev/shared/src/contexts/AnalyticsContext';
import { getLayout } from '../components/layouts/MainLayout';
import ProtectedPage from '../components/ProtectedPage';
import { HistoryType, ReadingHistory } from '../components/history';

const History = (): ReactElement => {
  const { trackEvent } = useContext(AnalyticsContext);
  const searchValue = useFeature(feature.search);
  const isLaptop = useMedia([laptop.replace('@media ', '')], [true], false);
  const seo = (
    <NextSeo
      title={
        searchValue === SearchExperiment.Control ? 'Reading history' : 'History'
      }
      nofollow
      noindex
    />
  );
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
      <div className="flex laptop:hidden absolute left-0 w-full h-px top-[6.75rem] bg-theme-divider-tertiary" />
      <ResponsivePageContainer className="relative !p-0" role="main">
        {searchValue === SearchExperiment.Control ? (
          <ReadingHistory />
        ) : (
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
        )}
      </ResponsivePageContainer>
    </ProtectedPage>
  );
};

History.getLayout = getLayout;

export default History;
