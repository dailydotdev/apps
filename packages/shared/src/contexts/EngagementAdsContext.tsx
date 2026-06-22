import type { ReactElement, ReactNode } from 'react';
import React, { createContext, useCallback, useContext, useMemo } from 'react';
import type {
  EngagementCreative,
  ResolvedCreative,
} from '../lib/engagementAds';
import {
  findCreativeForTags,
  findCreativeForTool,
  parseCreatives,
  resolveCreative,
} from '../lib/engagementAds';
import { useIsLightTheme } from '../hooks/utils/useThemedAsset';
import { useAuthContext } from './AuthContext';
import { isProduction, isTesting } from '../lib/constants';
import { googleCloudTakeoverEnabled } from '../features/googleCloudTakeover/config';

interface EngagementAdsContextValue {
  /** All creatives from boot, theme-resolved */
  creatives: ResolvedCreative[];

  /** Find a creative matching specific tags (stateless lookup) */
  getCreativeForTags: (tags: string[]) => ResolvedCreative | null;

  /** Find a creative whose tools list includes the given tool name */
  getCreativeForTool: (toolName?: string | null) => ResolvedCreative | null;
}

const defaultValue: EngagementAdsContextValue = {
  creatives: [],
  getCreativeForTags: () => null,
  getCreativeForTool: () => null,
};

export const EngagementAdsContext =
  createContext<EngagementAdsContextValue>(defaultValue);

export const useEngagementAdsContext = (): EngagementAdsContextValue =>
  useContext(EngagementAdsContext);

interface EngagementAdsProviderProps {
  children: ReactNode;
  rawCreatives?: EngagementCreative[];
}

export const EngagementAdsProvider = ({
  children,
  rawCreatives,
}: EngagementAdsProviderProps): ReactElement => {
  const isLight = useIsLightTheme();
  const { user } = useAuthContext();

  const resolvedCreatives = useMemo(() => {
    // DEMO: during the Google Cloud takeover, suppress the app-wide engagement
    // creatives so real feed posts don't animate / fetch a brand logo on upvote
    // (that's the only Google Cloud engagement ad in the demo, and it's scoped
    // to its own provider on the engagement card).
    if (googleCloudTakeoverEnabled && !isTesting) {
      return [];
    }

    if (isProduction && user?.isPlus) {
      return [];
    }

    return parseCreatives(rawCreatives).map((c) => resolveCreative(c, isLight));
  }, [rawCreatives, isLight, user?.isPlus]);

  const getCreativeForTags = useCallback(
    (tags: string[]) => findCreativeForTags(resolvedCreatives, tags),
    [resolvedCreatives],
  );

  const getCreativeForTool = useCallback(
    (toolName?: string | null) =>
      findCreativeForTool(resolvedCreatives, toolName),
    [resolvedCreatives],
  );

  const contextValue = useMemo(
    () => ({
      creatives: resolvedCreatives,
      getCreativeForTags,
      getCreativeForTool,
    }),
    [resolvedCreatives, getCreativeForTags, getCreativeForTool],
  );

  return (
    <EngagementAdsContext.Provider value={contextValue}>
      {children}
    </EngagementAdsContext.Provider>
  );
};
