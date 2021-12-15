import React, { ReactElement, ReactNode, useContext } from 'react';
import {
  desktop,
  desktopL,
  laptop,
  laptopL,
  laptopXL,
  tablet,
} from '../styles/media';
import FeedContext, {
  defaultFeedContextData,
  FeedContextData,
} from '../contexts/FeedContext';
import useMedia from '../hooks/useMedia';
import SettingsContext from '../contexts/SettingsContext';
import useShowSidebar from '../hooks/useShowSidebar';

export type FeedLayoutProps = { children?: ReactNode };

type DetermineFeedSettingsProps = {
  openSidebar: boolean;
  showSidebar: boolean;
};

export const feedBreakpoints = [
  tablet,
  laptop,
  laptopL,
  laptopXL,
  desktop,
  desktopL,
];

const baseFeedSettings: FeedContextData[] = [
  {
    pageSize: 9,
    adSpot: 0,
    numCards: {
      eco: 2,
      roomy: 2,
      cozy: 1,
    },
  },
  {
    pageSize: 13,
    adSpot: 0,
    numCards: {
      eco: 3,
      roomy: 2,
      cozy: 2,
    },
  },
  {
    pageSize: 17,
    adSpot: 0,
    numCards: {
      eco: 4,
      roomy: 3,
      cozy: 3,
    },
  },
  {
    pageSize: 21,
    adSpot: 0,
    numCards: {
      eco: 5,
      roomy: 4,
      cozy: 3,
    },
  },
  {
    pageSize: 25,
    adSpot: 0,
    numCards: {
      eco: 6,
      roomy: 5,
      cozy: 4,
    },
  },
  {
    pageSize: 29,
    adSpot: 0,
    numCards: {
      eco: 7,
      roomy: 6,
      cozy: 5,
    },
  },
];

const sidebarOpenFeedSettings: FeedContextData[] = [
  {
    pageSize: 7,
    adSpot: 2,
    numCards: {
      cozy: 1,
      eco: 1,
      roomy: 1,
    },
  },
  {
    pageSize: 9,
    adSpot: 0,
    numCards: {
      eco: 2,
      roomy: 2,
      cozy: 1,
    },
  },
  {
    pageSize: 13,
    adSpot: 0,
    numCards: {
      eco: 3,
      roomy: 2,
      cozy: 2,
    },
  },
  {
    pageSize: 17,
    adSpot: 0,
    numCards: {
      eco: 4,
      roomy: 3,
      cozy: 3,
    },
  },
  {
    pageSize: 21,
    adSpot: 0,
    numCards: {
      eco: 5,
      roomy: 4,
      cozy: 3,
    },
  },
  {
    pageSize: 25,
    adSpot: 0,
    numCards: {
      eco: 6,
      roomy: 5,
      cozy: 4,
    },
  },
];

const reversedBreakpoints = feedBreakpoints
  .map((media) => media.replace('@media ', ''))
  .reverse();

const reversedSettings = baseFeedSettings.reverse();
const reversedSettingsSidebar = sidebarOpenFeedSettings.reverse();

const determineFeedSettings = ({
  openSidebar,
  showSidebar,
}: DetermineFeedSettingsProps): FeedContextData[] => {
  return openSidebar && showSidebar
    ? reversedSettingsSidebar
    : reversedSettings;
};

export default function FeedLayout({
  children,
}: FeedLayoutProps): ReactElement {
  const { openSidebar } = useContext(SettingsContext);
  const { showSidebar } = useShowSidebar();
  const currentSettings = useMedia(
    reversedBreakpoints,
    determineFeedSettings({ openSidebar, showSidebar }),
    defaultFeedContextData,
  );

  return (
    <FeedContext.Provider value={currentSettings}>
      {children}
    </FeedContext.Provider>
  );
}
