import React, { ReactElement, ReactNode, useContext } from 'react';
import { desktop, laptop, laptopL, laptopXL, tablet } from '../styles/media';
import FeedContext, {
  defaultFeedContextData,
  FeedContextData,
} from '../contexts/FeedContext';
import { useMedia } from '../hooks';
import SettingsContext from '../contexts/SettingsContext';
import useSidebarRendered from '../hooks/useSidebarRendered';

export type FeedLayoutProps = { children?: ReactNode };

type DetermineFeedSettingsProps = {
  sidebarExpanded: boolean;
  sidebarRendered: boolean;
};

export const feedBreakpoints = [tablet, laptop, laptopL, laptopXL, desktop];

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
];

const reversedBreakpoints = feedBreakpoints
  .map((media) => media.replace('@media ', ''))
  .reverse();

const digitsRegex = /\d+/;

const replaceDigitsWithIncrement = (str: string, increment: number): string => {
  const match = str.match(digitsRegex);
  if (!match) {
    return str;
  }
  return str.replace(match[0], `${parseInt(match[0], 10) + increment}`);
};

const sidebarRenderedWidth = 44;
const reversedBreakpointsSidebarRendered = reversedBreakpoints.map(
  (breakpoint) => replaceDigitsWithIncrement(breakpoint, sidebarRenderedWidth),
);

const sidebarOpenWidth = 240;
const reversedBreakpointsSidebarOpen = reversedBreakpoints.map((breakpoint) =>
  replaceDigitsWithIncrement(breakpoint, sidebarOpenWidth),
);

const reversedSettings = baseFeedSettings.reverse();

const determineBreakPoints = ({
  sidebarExpanded,
  sidebarRendered,
}: DetermineFeedSettingsProps): string[] => {
  if (sidebarRendered) {
    return sidebarExpanded
      ? reversedBreakpointsSidebarOpen
      : reversedBreakpointsSidebarRendered;
  }
  return reversedBreakpoints;
};

export default function FeedLayout({
  children,
}: FeedLayoutProps): ReactElement {
  const { sidebarExpanded } = useContext(SettingsContext);
  const { sidebarRendered } = useSidebarRendered();

  const currentSettings = useMedia(
    determineBreakPoints({ sidebarExpanded, sidebarRendered }),
    reversedSettings,
    defaultFeedContextData,
  );

  return (
    <FeedContext.Provider value={currentSettings}>
      {children}
    </FeedContext.Provider>
  );
}
