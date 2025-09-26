import type { ReactElement, PropsWithChildren } from 'react';
import React, { useMemo } from 'react';
import { desktop, laptop, laptopL, laptopXL, tablet } from '../styles/media';
import { useConditionalFeature, useMedia, usePlusSubscription } from '../hooks';
import { useSettingsContext } from './SettingsContext';
import useSidebarRendered from '../hooks/useSidebarRendered';

import type { Spaciness } from '../graphql/settings';
import { featureFeedAdTemplate } from '../lib/featureManagement';
import type { FeedAdTemplate } from '../lib/feed';

export type FeedContextData = {
  pageSize: number;
  numCards: Record<Spaciness, number>;
  adTemplate?: FeedAdTemplate;
};

export type FeedSettingsKeys =
  | 'default'
  | 'tablet'
  | 'laptop'
  | 'laptopL'
  | 'laptopXL'
  | 'desktop';

export type FeedSettings = {
  pageSize: number;
  breakpoint?: string;
  numCards: {
    eco: number;
    roomy: number;
    cozy: number;
  };
  adTemplate?: FeedAdTemplate;
};

const baseFeedSettings: Record<FeedSettingsKeys, FeedSettings> = {
  default: {
    pageSize: 7,
    numCards: {
      cozy: 1,
      eco: 1,
      roomy: 1,
    },
    adTemplate: featureFeedAdTemplate.defaultValue.default,
  },
  tablet: {
    pageSize: 9,
    breakpoint: tablet,
    numCards: {
      eco: 2,
      roomy: 2,
      cozy: 1,
    },
  },
  laptop: {
    pageSize: 13,
    breakpoint: laptop,
    numCards: {
      eco: 3,
      roomy: 2,
      cozy: 2,
    },
  },
  laptopL: {
    pageSize: 17,
    breakpoint: laptopL,
    numCards: {
      eco: 4,
      roomy: 3,
      cozy: 3,
    },
  },
  laptopXL: {
    pageSize: 21,
    breakpoint: laptopXL,
    numCards: {
      eco: 5,
      roomy: 4,
      cozy: 3,
    },
  },
  desktop: {
    pageSize: 25,
    breakpoint: desktop,
    numCards: {
      eco: 6,
      roomy: 5,
      cozy: 4,
    },
  },
};

const digitsRegex = /\d+/;

const replaceDigitsWithIncrement = (str: string, increment: number): string => {
  const match = str.match(digitsRegex);
  if (!match) {
    return str;
  }
  return str.replace(match[0], `${parseInt(match[0], 10) + increment}`);
};

const sidebarRenderedWidth = 44;
const sidebarOpenWidth = 240;

const FeedContext = React.createContext<FeedContextData>(
  baseFeedSettings.default,
);

export function FeedLayoutProvider({
  children,
}: PropsWithChildren): ReactElement {
  const { sidebarExpanded } = useSettingsContext();
  const { sidebarRendered } = useSidebarRendered();
  const { isPlus } = usePlusSubscription();
  const feedAdTemplateFeature = useConditionalFeature({
    feature: featureFeedAdTemplate,
    shouldEvaluate: !isPlus,
  });

  const { feedSettings, defaultFeedSettings } = useMemo(() => {
    const enhancedFeedSettings = Object.entries(baseFeedSettings).reduce(
      (acc, [feedSettingsKey, feedSettingsValue]) => {
        acc[feedSettingsKey] = {
          ...feedSettingsValue,
          adTemplate:
            feedAdTemplateFeature.value[feedSettingsKey] ||
            feedAdTemplateFeature.value.default,
        };

        return acc;
      },
      {},
    ) as typeof baseFeedSettings;

    return {
      feedSettings: [
        enhancedFeedSettings.desktop,
        enhancedFeedSettings.laptopXL,
        enhancedFeedSettings.laptopL,
        enhancedFeedSettings.laptop,
        enhancedFeedSettings.tablet,
      ],
      defaultFeedSettings: enhancedFeedSettings.default,
    };
  }, [feedAdTemplateFeature.value]);

  // Generate the breakpoints for the feed settings
  const feedBreakpoints = useMemo(() => {
    const breakpoints = feedSettings.map((setting) =>
      setting.breakpoint.replace('@media ', ''),
    );

    if (!sidebarRendered) {
      return breakpoints;
    }

    if (sidebarExpanded) {
      return breakpoints.map((breakpoint) =>
        replaceDigitsWithIncrement(breakpoint, sidebarOpenWidth),
      );
    }

    return breakpoints.map((breakpoint) =>
      replaceDigitsWithIncrement(breakpoint, sidebarRenderedWidth),
    );
  }, [feedSettings, sidebarExpanded, sidebarRendered]);

  const currentSettings = useMedia(
    feedBreakpoints,
    feedSettings,
    defaultFeedSettings,
  );

  return (
    <FeedContext.Provider value={currentSettings}>
      {children}
    </FeedContext.Provider>
  );
}

export default FeedContext;
