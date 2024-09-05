import { MainLayoutProps } from '@dailydotdev/shared/src/components/MainLayout';
import { ReactNode } from 'react';

import { getLayout as getFooterNavBarLayout } from './FooterNavBarLayout';
import { getLayout as getMainLayout } from './MainLayout';

export const GetSearchLayout = (
  page: ReactNode,
  pageProps?: Record<string, unknown>,
  layoutProps: MainLayoutProps = {},
): ReactNode => {
  const finalProps = { screenCentered: false, ...layoutProps };

  return getFooterNavBarLayout(getMainLayout(page, pageProps, finalProps));
};
