import React from 'react';
import { renderHook } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { useLeaderboardShareEnabled } from './useLeaderboardShareEnabled';
import { useConditionalFeature } from '../useConditionalFeature';
import type { Feature } from '../../lib/featureManagement';
import {
  featureSharingVisibility,
  featureShareLeaderboard,
} from '../../lib/featureManagement';
import { TestBootProvider } from '../../../__tests__/helpers/boot';

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

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <TestBootProvider client={new QueryClient()}>{children}</TestBootProvider>
);

beforeEach(() => {
  jest.clearAllMocks();
  evaluated.length = 0;
});

describe('useLeaderboardShareEnabled', () => {
  it('is off while the sharing-visibility kill switch is off', () => {
    mockFlags({
      [featureSharingVisibility.id]: false,
      [featureShareLeaderboard.id]: true,
    });

    const { result } = renderHook(() => useLeaderboardShareEnabled(), {
      wrapper,
    });

    expect(result.current).toBe(false);
    // The per-topic flag must not be evaluated for control users.
    expect(evaluated).not.toContain(featureShareLeaderboard.id);
  });

  it('is off when the per-topic flag is off', () => {
    mockFlags({
      [featureSharingVisibility.id]: true,
      [featureShareLeaderboard.id]: false,
    });

    const { result } = renderHook(() => useLeaderboardShareEnabled(), {
      wrapper,
    });

    expect(result.current).toBe(false);
  });

  it('is on only when both flags are on', () => {
    mockFlags({
      [featureSharingVisibility.id]: true,
      [featureShareLeaderboard.id]: true,
    });

    const { result } = renderHook(() => useLeaderboardShareEnabled(), {
      wrapper,
    });

    expect(result.current).toBe(true);
  });

  it('never evaluates anything when the caller opts out', () => {
    mockFlags({
      [featureSharingVisibility.id]: true,
      [featureShareLeaderboard.id]: true,
    });

    const { result } = renderHook(() => useLeaderboardShareEnabled(false), {
      wrapper,
    });

    expect(result.current).toBe(false);
    expect(evaluated).toHaveLength(0);
  });
});
