import React, { createContext, useContext } from 'react';
import type { PropsWithChildren, ReactElement } from 'react';
import { fn } from 'storybook/test';

type FeatureLike = { id: string };
type FeatureOverrideValues = Record<string, unknown>;

const FeatureOverridesContext = createContext<FeatureOverrideValues>({});

/**
 * Pins specific flags for one subtree, so a single story can render several
 * experiment arms next to each other. Flags left out keep the `control` value
 * every other story relies on.
 */
export const FeatureOverrides = ({
  values,
  children,
}: PropsWithChildren<{ values: FeatureOverrideValues }>): ReactElement => (
  <FeatureOverridesContext.Provider value={values}>
    {children}
  </FeatureOverridesContext.Provider>
);

/** Returns the story-pinned value for a flag, or undefined when unpinned. */
export const useFeatureOverride = (feature?: FeatureLike): unknown => {
  const overrides = useContext(FeatureOverridesContext);

  return feature && feature.id in overrides ? overrides[feature.id] : undefined;
};

export const useFeature = fn((feature?: FeatureLike) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks -- runs during render
  const override = useFeatureOverride(feature);

  return override === undefined ? 'control' : override;
}).mockName('useFeature');

export * from '@dailydotdev/shared/src/components/GrowthBookProvider';
