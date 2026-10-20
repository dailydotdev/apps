import type { ContextType, PropsWithChildren, ReactElement } from 'react';
import React from 'react';
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

const flagValues: Record<string, unknown> = {
  ...codeDefaults,
  ...productionFlags,
};

const getValue = <T,>(id: string, fallback: T): T =>
  id in flagValues ? (flagValues[id] as T) : fallback;

type FeaturesReady = ContextType<typeof FeaturesReadyContext>;

const growthbook = {
  getFeatureValue: getValue,
  isOn: (id: string) => !!getValue(id, false),
  getFeatures: () => ({}),
} as unknown as ContextType<typeof GrowthBookContext>['growthbook'];

const featuresReady: FeaturesReady = {
  ready: true,
  getFeatureValue: ((feature: { id: string; defaultValue: unknown }) =>
    getValue(
      feature.id,
      feature.defaultValue,
    )) as FeaturesReady['getFeatureValue'],
};

/** Must sit inside the boot providers, whose own GrowthBook context it overrides. */
export const ProductionFlags = ({
  children,
}: PropsWithChildren): ReactElement => (
  <FeatureOverrides values={flagValues}>
    <GrowthBookContext.Provider value={{ growthbook }}>
      <FeaturesReadyContext.Provider value={featuresReady}>
        {children}
      </FeaturesReadyContext.Provider>
    </GrowthBookContext.Provider>
  </FeatureOverrides>
);
