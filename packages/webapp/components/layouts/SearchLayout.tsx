import { ReactNode } from 'react';
import { MainLayoutProps } from '@dailydotdev/shared/src/components/MainLayout';
import { getLayout as getMainLayout } from './MainLayout';
import { getLayout as getFooterNavBarLayout } from './FooterNavBarLayout';

export const GetSearchLayout = (
  page: ReactNode,
  pageProps?: Record<string, unknown>,
  layoutProps: MainLayoutProps = {},
): ReactNode => {
  const finalProps = { screenCentered: false, ...layoutProps };

  return getFooterNavBarLayout(getMainLayout(page, pageProps, finalProps));
};
