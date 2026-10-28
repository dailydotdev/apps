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
import { isProduction } from '../lib/constants';
import { isSourceAdFree } from '../lib/ads';
import { useActivePostContext } from './ActivePostContext';

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

const EngagementAdsContext =
  createContext<EngagementAdsContextValue>(defaultValue);

/**
 * Brand sponsorships (sponsored tags, keyword highlights, the branded upvote,
 * sponsored tools) are ads too: under a post from an ad-free source every
 * lookup comes back empty, so each surface falls back to its organic render.
 */
export const useEngagementAdsContext = (): EngagementAdsContextValue => {
  const value = useContext(EngagementAdsContext);
  const { activePost } = useActivePostContext();

  return isSourceAdFree(activePost?.source) ? defaultValue : value;
};

/** Blanks brand sponsorships for a subtree, such as an ad-free squad's feed. */
export const NoEngagementAdsProvider = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => (
  <EngagementAdsContext.Provider value={defaultValue}>
    {children}
  </EngagementAdsContext.Provider>
);

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
