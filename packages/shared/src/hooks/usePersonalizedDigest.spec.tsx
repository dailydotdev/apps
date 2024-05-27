import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { waitFor } from '@testing-library/react';
import nock from 'nock';
import { AuthContextProvider } from '../contexts/AuthContext';
import { usePersonalizedDigest } from './usePersonalizedDigest';
import {
  GET_PERSONALIZED_DIGEST_SETTINGS,
  SUBSCRIBE_PERSONALIZED_DIGEST_MUTATION,
  UNSUBSCRIBE_PERSONALIZED_DIGEST_MUTATION,
  UserPersonalizedDigestType,
} from '../graphql/users';
import user from '../../__tests__/fixture/loggedUser';
import { mockGraphQL } from '../../__tests__/helpers/graphql';
import { waitForNock } from '../../__tests__/helpers/utilities';
import { ApiError } from '../graphql/common';

const client = new QueryClient();
const noop = jest.fn();

const Wrapper = ({ children }) => {
  return (
    <QueryClientProvider client={client}>
      <AuthContextProvider
        user={user}
        squads={[]}
        getRedirectUri={noop}
        updateUser={noop}
        tokenRefreshed={false}
      >
        {children}
      </AuthContextProvider>
    </QueryClientProvider>
  );
};

describe('usePersonalizedDigest hook', () => {
  beforeEach(() => {
    client.clear();
    nock.cleanAll();

    mockGraphQL({
      request: { query: GET_PERSONALIZED_DIGEST_SETTINGS, variables: {} },
      result: {
        data: {
          personalizedDigest: [
            {
              preferredDay: 1,
              preferredHour: 9,
              type: UserPersonalizedDigestType.Digest,
            },
          ],
        },
      },
    });
  });

  it('should fetch personalized digest for user', async () => {
    const { result } = renderHook(() => usePersonalizedDigest(), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await waitForNock();

    expect(
      result.current.getPersonalizedDigest(UserPersonalizedDigestType.Digest),
    ).toMatchObject({
      preferredDay: 1,
      preferredHour: 9,
    });
  });

  it('should subscribe to personalized digest for user', async () => {
    const { result } = renderHook(() => usePersonalizedDigest(), {
      wrapper: Wrapper,
    });

    let mutationCalled = false;

    mockGraphQL({
      request: {
        query: SUBSCRIBE_PERSONALIZED_DIGEST_MUTATION,
        variables: {
          day: 3,
          hour: 8,
          type: UserPersonalizedDigestType.Digest,
        },
      },
      result: () => {
        mutationCalled = true;

        return {
          data: {
            subscribePersonalizedDigest: {
              preferredDay: 1,
              preferredHour: 9,
              type: UserPersonalizedDigestType.Digest,
            },
          },
        };
      },
    });

    result.current.subscribePersonalizedDigest();

    await waitFor(() => expect(mutationCalled).toBe(true));
    await waitForNock();
  });

  it('should unsubscribe to personalized digest for user', async () => {
    const { result } = renderHook(() => usePersonalizedDigest(), {
      wrapper: Wrapper,
    });

    let mutationCalled = false;

    mockGraphQL({
      request: {
        query: UNSUBSCRIBE_PERSONALIZED_DIGEST_MUTATION,
        variables: { type: UserPersonalizedDigestType.Digest },
      },
      result: () => {
        mutationCalled = true;

        return {
          data: {
            _: true,
          },
        };
      },
    });

    result.current.unsubscribePersonalizedDigest();

    await waitFor(() => expect(mutationCalled).toBe(true));
    await waitForNock();
  });

  it('should handle error for personalized digest if user is not subscribed', async () => {
    nock.cleanAll();

    mockGraphQL({
      request: { query: GET_PERSONALIZED_DIGEST_SETTINGS, variables: {} },
      result: {
        errors: [
          {
            message: 'Not subscribed to personalized digest',
            extensions: {
              code: ApiError.NotFound,
            },
          },
        ],
      },
    });

    const { result } = renderHook(() => usePersonalizedDigest(), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await waitForNock();

    expect(
      result.current.getPersonalizedDigest(UserPersonalizedDigestType.Digest),
    ).toBeNull();
  });
});
