import type { ReactElement, ReactNode } from 'react';
import React, { useMemo } from 'react';
import { EngagementAdsContext } from '../../contexts/EngagementAdsContext';
import {
  findCreativeForTags,
  findCreativeForTool,
  parseCreatives,
  resolveCreative,
} from '../../lib/engagementAds';
import { useIsLightTheme } from '../../hooks/utils/useThemedAsset';
import { googleCloudEngagementCreativeRaw } from './engagementContent';

// Scoped engagement-ads provider for the demo. Supplies just the Google Cloud
// creative to its subtree, so the branded upvote animation and sponsored tag
// fire ONLY on the card it wraps. Unlike the app-level provider, it doesn't
// drop creatives for Plus users — the sales demo must render on any account.
export const GoogleCloudEngagementProvider = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => {
  const isLight = useIsLightTheme();

  const value = useMemo(() => {
    const creatives = parseCreatives([googleCloudEngagementCreativeRaw]).map(
      (creative) => resolveCreative(creative, isLight),
    );
    return {
      creatives,
      getCreativeForTags: (tags: string[]) =>
        findCreativeForTags(creatives, tags),
      getCreativeForTool: (toolName?: string | null) =>
        findCreativeForTool(creatives, toolName),
    };
  }, [isLight]);

  return (
    <EngagementAdsContext.Provider value={value}>
      {children}
    </EngagementAdsContext.Provider>
  );
};
