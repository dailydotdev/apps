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

  const resolvedCreatives = useMemo(() => {
    return parseCreatives(rawCreatives).map((c) => resolveCreative(c, isLight));
  }, [rawCreatives, isLight]);

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
