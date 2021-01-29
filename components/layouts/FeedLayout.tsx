import React, { ReactElement, ReactNode } from 'react';
import MainLayout, { MainLayoutProps } from './MainLayout';
import {
  desktop,
  desktopL,
  laptop,
  laptopL,
  laptopXL,
  tablet,
} from '../../styles/media';
import FeedSettingsContext, {
  defaultFeedSettings,
  FeedSettings,
} from '../FeedSettingsContext';
import useMedia from '../../lib/useMedia';
import { getLayout as getFooterNavBarLayout } from './FooterNavBarLayout';

export type FeedLayoutProps = { children?: ReactNode };

export const feedBreakpoints = [
  tablet,
  laptop,
  laptopL,
  laptopXL,
  desktop,
  desktopL,
];
export const feedSettings: FeedSettings[] = [
  { pageSize: 9, adSpot: 0, numCards: 2 },
  { pageSize: 13, adSpot: 0, numCards: 3 },
  { pageSize: 17, adSpot: 0, numCards: 4 },
  { pageSize: 21, adSpot: 0, numCards: 5 },
  { pageSize: 25, adSpot: 0, numCards: 6 },
  { pageSize: 29, adSpot: 0, numCards: 7 },
];

export default function FeedLayout({
  children,
}: FeedLayoutProps): ReactElement {
  const currentSettings = useMedia(
    feedBreakpoints.map((media) => media.replace('@media ', '')).reverse(),
    feedSettings.reverse(),
    defaultFeedSettings,
  );

  return (
    <FeedSettingsContext.Provider value={currentSettings}>
      {children}
    </FeedSettingsContext.Provider>
  );
}

export const getLayout = (
  page: ReactNode,
  pageProps: Record<string, unknown>,
  layoutProps: MainLayoutProps,
): ReactNode =>
  getFooterNavBarLayout(
    <MainLayout {...layoutProps}>
      <FeedLayout>{page}</FeedLayout>
    </MainLayout>,
  );
