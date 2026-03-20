import type { ReactElement, ReactNode } from 'react';
import React, { createContext, useCallback, useContext, useMemo } from 'react';
import type {
  EngagementCreative,
  ResolvedCreative,
} from '../lib/engagementAds';
import { findCreativeForTags, resolveCreative } from '../lib/engagementAds';
import { useIsLightTheme } from '../hooks/utils/useThemedAsset';

interface EngagementAdsContextValue {
  /** All creatives from boot, theme-resolved */
  creatives: ResolvedCreative[];

  /** Find a creative matching specific tags (stateless lookup) */
  getCreativeForTags: (tags: string[]) => ResolvedCreative | null;
}

const defaultValue: EngagementAdsContextValue = {
  creatives: [],
  getCreativeForTags: () => null,
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
    if (!rawCreatives?.length) {
      return [];
    }

    return rawCreatives.map((c) => resolveCreative(c, isLight));
  }, [rawCreatives, isLight]);

  const getCreativeForTags = useCallback(
    (tags: string[]) => findCreativeForTags(resolvedCreatives, tags),
    [resolvedCreatives],
  );

  const contextValue = useMemo(
    () => ({
      creatives: resolvedCreatives,
      getCreativeForTags,
    }),
    [resolvedCreatives, getCreativeForTags],
  );

  return (
    <EngagementAdsContext.Provider value={contextValue}>
      {children}
    </EngagementAdsContext.Provider>
  );
};
