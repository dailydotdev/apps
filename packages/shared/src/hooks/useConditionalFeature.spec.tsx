import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { waitFor } from '@testing-library/react';
import { useConditionalFeature } from './useConditionalFeature';
import { Feature } from '../lib/featureManagement';
import loggedUser from '../../__tests__/fixture/loggedUser';
import { AuthContextProvider } from '../contexts/AuthContext';
import { GrowthBookProvider } from '../components/GrowthBookProvider';
import { BootApp } from '../lib/boot';

const client = new QueryClient();
const testFeature: Feature<string> = new Feature<string>(
  'test_feature',
  'default_value',
);

const createWrapper = ({ value = testFeature.defaultValue }) => {
  const Wrapper = ({ children }) => (
    <QueryClientProvider client={client}>
      <AuthContextProvider
        user={loggedUser}
        updateUser={jest.fn()}
        tokenRefreshed
        getRedirectUri={jest.fn()}
        loadingUser={false}
        loadedUserFromCache
        squads={[]}
      >
        <GrowthBookProvider
          app={BootApp.Test}
          user={loggedUser}
          deviceId="123"
          experimentation={{
            f: '{}',
            e: [],
            a: [],
            features: {
              test_feature: {
                defaultValue: value,
              },
            },
          }}
        >
          {children}
        </GrowthBookProvider>
      </AuthContextProvider>
    </QueryClientProvider>
  );

  return Wrapper;
};

describe('useConditionalFeature hook', () => {
  beforeEach(() => {
    client.clear();
  });

  it('should return undefined and isLoading if not ready', async () => {
    const { result } = renderHook(
      () =>
        useConditionalFeature({ feature: testFeature, shouldEvaluate: false }),
      {
        wrapper: createWrapper({}),
      },
    );

    await waitFor(() => expect(result.current.isLoading).toBeTruthy());
    expect(result.current.value).toBe(undefined);
  });

  it('should return feature value if evaluation is true', async () => {
    const { result } = renderHook(
      () =>
        useConditionalFeature({
          feature: testFeature,
          shouldEvaluate: true,
        }),
      {
        wrapper: createWrapper({ value: 'new_value' }),
      },
    );

    await waitFor(() => expect(result.current.isLoading).toBeFalsy());
    expect(result.current.value).toBe('new_value');
  });
});
