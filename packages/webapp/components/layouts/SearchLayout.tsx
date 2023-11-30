import { ReactNode } from 'react';
import { MainLayoutProps } from '@dailydotdev/shared/src/components/MainLayout';
import { useFeature } from '@dailydotdev/shared/src/components/GrowthBookProvider';
import { feature } from '@dailydotdev/shared/src/lib/featureManagement';
import { SearchExperiment } from '@dailydotdev/shared/src/lib/featureValues';
import { getLayout } from './MainLayout';
import { getMainFeedLayout, mainFeedLayoutProps } from './MainFeedPage';

const props: Record<SearchExperiment, Record<string, unknown>> = {
  control: { ...mainFeedLayoutProps },
  v1: { screenCentered: false },
};

export const GetSearchLayout = (
  page: ReactNode,
  pageProps?: Record<string, unknown>,
  layoutProps: MainLayoutProps = {},
): ReactNode => {
  const searchVersion = useFeature(feature.search);
  const finalProps = { ...props[searchVersion], ...layoutProps };

  if (searchVersion === SearchExperiment.V1) {
    return getLayout(page, pageProps, finalProps);
  }

  return getMainFeedLayout(page, pageProps, finalProps);
};
