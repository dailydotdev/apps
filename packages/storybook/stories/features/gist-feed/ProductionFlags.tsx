import type { ContextType, PropsWithChildren, ReactElement } from 'react';
import React, { useMemo } from 'react';
import * as featureManagement from '@dailydotdev/shared/src/lib/featureManagement';
import { Feature } from '@dailydotdev/shared/src/lib/featureManagement';
import {
  FeatureOverrides,
  FeaturesReadyContext,
  GrowthBookContext,
} from '../../../mock/GrowthBookProvider';
import productionFlags from './productionFlags.json';

// Storybook's GrowthBook mock reports every flag as on. Production resolves a
// flag to its GrowthBook value when GrowthBook defines it and to the code
// default otherwise, so these are the values one production account resolved
// on 2026-10-19, which is what "Today" has to look like.
const codeDefaults = Object.fromEntries(
  Object.values(featureManagement).flatMap((value) =>
    value instanceof Feature ? [[value.id, value.defaultValue]] : [],
  ),
);

const productionValues: Record<string, unknown> = {
  ...codeDefaults,
  ...productionFlags,
};

type FeaturesReady = ContextType<typeof FeaturesReadyContext>;
type GrowthBookValue = ContextType<typeof GrowthBookContext>['growthbook'];

/** Must sit inside the boot providers, whose own GrowthBook context it overrides. */
export const ProductionFlags = ({
  overrides,
  children,
}: PropsWithChildren<{
  /** Flags a story turns on or off on top of production, like an experiment arm. */
  overrides?: Record<string, unknown>;
}>): ReactElement => {
  const value = useMemo(() => {
    const flagValues = { ...productionValues, ...overrides };
    const getValue = <T,>(id: string, fallback: T): T =>
      id in flagValues ? (flagValues[id] as T) : fallback;

    return {
      flagValues,
      growthbook: {
        getFeatureValue: getValue,
        isOn: (id: string) => !!getValue(id, false),
        getFeatures: () => ({}),
      } as unknown as GrowthBookValue,
      featuresReady: {
        ready: true,
        getFeatureValue: ((feature: { id: string; defaultValue: unknown }) =>
          getValue(
            feature.id,
            feature.defaultValue,
          )) as FeaturesReady['getFeatureValue'],
      } as FeaturesReady,
    };
  }, [overrides]);

  return (
    <FeatureOverrides values={value.flagValues}>
      <GrowthBookContext.Provider value={{ growthbook: value.growthbook }}>
        <FeaturesReadyContext.Provider value={value.featuresReady}>
          {children}
        </FeaturesReadyContext.Provider>
      </GrowthBookContext.Provider>
    </FeatureOverrides>
  );
};
