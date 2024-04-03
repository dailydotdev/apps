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
import { useMobileUxExperiment } from '@dailydotdev/shared/src/hooks/useMobileUxExperiment';
import { ButtonSize } from '@dailydotdev/shared/src/components/buttons/common';
import { Dropdown } from '@dailydotdev/shared/src/components/fields/Dropdown';
import { HistoryType, ReadingHistory } from '../components/history';
import ProtectedPage from '../components/ProtectedPage';
import { geHistoryLayout } from '../components/layouts/HistoryLayout';

const feedOptions = [
  {
    value: HistoryType.Reading,
  },
  {
    value: HistoryType.Search,
  },
];

const History = (): ReactElement => {
  const { trackEvent } = useContext(AnalyticsContext);
  const isLaptop = useViewSize(ViewSize.Laptop);
  const seo = <NextSeo title="History" nofollow noindex />;
  const router = useRouter();
  const tabQuery = router.query?.t?.toString() as HistoryType;
  const [page, setPage] = useState(HistoryType.Reading);
  const { isNewMobileLayout } = useMobileUxExperiment();
  const selectedFeedIdx = feedOptions.findIndex((f) => f.value === page);

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
      {!isNewMobileLayout && (
        <div className="absolute left-0 top-[6.75rem] flex h-px w-full bg-theme-divider-tertiary laptop:hidden" />
      )}

      <ResponsivePageContainer className="relative !p-0" role="main">
        {isNewMobileLayout && (
          <>
            <Dropdown
              dynamicMenuWidth
              shouldIndicateSelected
              buttonSize={ButtonSize.Medium}
              className={{
                button: 'px-1',
                label: 'mr-5',
                container: 'self-start px-4 pt-4',
                indicator: '!ml-2',
              }}
              iconOnly={false}
              key="feed"
              selectedIndex={selectedFeedIdx}
              renderItem={(_, index) => (
                <span className="typo-callout">{feedOptions[index].value}</span>
              )}
              options={feedOptions.map((f) => f.value)}
              onChange={(feed: HistoryType) => handleSetPage(feed)}
            />

            {page === HistoryType.Reading && <ReadingHistory />}

            {page === HistoryType.Search && (
              <SearchHistory origin={Origin.HistoryPage} />
            )}
          </>
        )}

        {!isNewMobileLayout && (
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

History.getLayout = geHistoryLayout;

export default History;
