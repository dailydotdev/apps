import { renderHook } from '@testing-library/react';
import { useSquadDirectoryShareEnabled } from './useSquadDirectoryShareEnabled';
import { useConditionalFeature } from '../useConditionalFeature';
import type { Feature } from '../../lib/featureManagement';
import {
  featureSharingVisibility,
  featureShareSquadDirectory,
} from '../../lib/featureManagement';

jest.mock('../useConditionalFeature', () => ({
  useConditionalFeature: jest.fn(),
}));

const conditionalFeatureMock = useConditionalFeature as jest.Mock;
const evaluated: string[] = [];

const mockFlags = (flags: Record<string, boolean>) =>
  conditionalFeatureMock.mockImplementation(
    ({
      feature,
      shouldEvaluate,
    }: {
      feature: Feature<boolean>;
      shouldEvaluate?: boolean;
    }) => {
      if (shouldEvaluate !== false) {
        evaluated.push(feature.id);
      }

      return {
        value:
          shouldEvaluate === false ? feature.defaultValue : flags[feature.id],
        isLoading: false,
      };
    },
  );

beforeEach(() => {
  jest.clearAllMocks();
  evaluated.length = 0;
});

describe('useSquadDirectoryShareEnabled', () => {
  it('is off while the sharing-visibility kill switch is off', () => {
    mockFlags({
      [featureSharingVisibility.id]: false,
      [featureShareSquadDirectory.id]: true,
    });

    const { result } = renderHook(() => useSquadDirectoryShareEnabled());

    expect(result.current).toBe(false);
    // The per-topic flag must not be evaluated for control users.
    expect(evaluated).not.toContain(featureShareSquadDirectory.id);
  });

  it('is off when the per-topic flag is off', () => {
    mockFlags({
      [featureSharingVisibility.id]: true,
      [featureShareSquadDirectory.id]: false,
    });

    const { result } = renderHook(() => useSquadDirectoryShareEnabled());

    expect(result.current).toBe(false);
  });

  it('is on only when both flags are on', () => {
    mockFlags({
      [featureSharingVisibility.id]: true,
      [featureShareSquadDirectory.id]: true,
    });

    const { result } = renderHook(() => useSquadDirectoryShareEnabled());

    expect(result.current).toBe(true);
  });
});
