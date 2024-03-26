import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useConditionalFeature } from './useConditionalFeature';
import { Feature } from '../lib/featureManagement';

const client = new QueryClient();
const testFeature: Feature<string> = new Feature<string>(
  'test_feature',
  'default_value',
);

const Wrapper = ({ children }) => {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

describe('useConditionalFeature hook', () => {
  beforeEach(() => {
    client.clear();
  });

  it('should return default value if evaluation is false', async () => {
    const { result } = renderHook(
      () =>
        useConditionalFeature({ feature: testFeature, shouldEvaluate: false }),
      {
        wrapper: Wrapper,
      },
    );

    expect(result.current).toBe('default_value');
  });

  it('should return feature value if evaluation is true', async () => {
    const { result } = renderHook(
      () =>
        useConditionalFeature({ feature: testFeature, shouldEvaluate: true }),
      {
        wrapper: Wrapper,
      },
    );

    expect(result.current).toBe('default_value');
  });
});
