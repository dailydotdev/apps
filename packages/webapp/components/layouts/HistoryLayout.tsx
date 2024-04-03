import { ReactNode } from 'react';
import { MainLayoutProps } from '@dailydotdev/shared/src/components/MainLayout';
import { getLayout as getMainLayout } from './MainLayout';
import { getLayout as getFooterNavBarLayout } from './FooterNavBarLayout';

export const geHistoryLayout = (
  page: ReactNode,
  pageProps?: Record<string, unknown>,
  layoutProps: MainLayoutProps = {},
): ReactNode => {
  return getFooterNavBarLayout(getMainLayout(page, pageProps, layoutProps));
};
